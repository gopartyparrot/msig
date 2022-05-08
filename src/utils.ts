import { Program, Provider, Wallet } from "@project-serum/anchor"
import { AccountInfo, AccountMeta, Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { readFileSync } from "fs"
import { ProposalBase } from "./instructions/ProposalBase"
import { MultisigStruct, MultisigTransactionStruct } from "./types"
import util from "util"

import multisigIdl from "./serum_multisig_idl.json"
import { IEnv, MultisigContext } from "."
import { SingleConnectionBroadcaster, SolanaProvider } from "@saberhq/solana-contrib"

export function printKeys(keys: Array<AccountMeta>) {
  const bs = (b: boolean): string => (b ? "y" : "n") //bool string
  const pk = (k: PublicKey): string => k.toBase58().padEnd(45, " ") //pad pubkey
  for (let i = 0; i < keys.length; i++) {
    const { pubkey, isWritable, isSigner } = keys[i]
    console.log(`${i}  ${pk(pubkey)} w: ${bs(isWritable)} s: ${bs(isSigner)}`)
  }
  console.log("")
}

interface NestedObject<T> extends Record<string, T | NestedObject<T>> {}

export interface NestedObjectWithPublicKey extends NestedObject<PublicKey> {}

function formatNestedObjectWithPublicKey(obj: NestedObjectWithPublicKey, loop = 0): string {
  let str = ""
  for (const [key, value] of Object.entries(obj ?? {})) {
    if (value?.constructor?.name == "PublicKey") {
      str += `\n${new Array(loop).fill("  ").join("")}${key}: ${value}`
    } else {
      str += `\n${new Array(loop).fill("  ").join("")}${key}: ${formatNestedObjectWithPublicKey(
        value as any,
        loop + 1,
      )}`
    }
  }
  return str
}

export function printNestedObjectWithPublicKey(obj: NestedObjectWithPublicKey) {
  if (obj === undefined || obj === null) {
    return
  }
  console.log(formatNestedObjectWithPublicKey(obj))
}

export async function fetchProposalsChainStates(
  multisigProg: Program,
  proposals: ProposalBase[],
): Promise<(AccountInfo<MultisigTransactionStruct> | null)[]> {
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey)
  const chainTransactions: (AccountInfo<MultisigTransactionStruct> | null)[] = (
    await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys)
  ).map((acc): AccountInfo<MultisigTransactionStruct> => {
    return !acc
      ? null
      : {
          ...acc,
          data: multisigProg.coder.accounts.decode("Transaction", acc.data as Buffer),
        }
  })
  return chainTransactions
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function buildMultisigProgram(provider: Provider, multisigProgramId: PublicKey): Program {
  return new Program(multisigIdl as any, multisigProgramId, provider)
}

export function getWalletFromFile(path: string): Keypair {
  return Keypair.fromSecretKey(Buffer.from(JSON.parse(readFileSync(path, { encoding: "utf-8" }))))
}

export function getProgramFromEnv(ev: IEnv): Program {
  const provider = Provider.env()
  return buildMultisigProgram(provider, ev.multisigProgram)
}

export async function findMultisigSigner(
  multisigProgram: PublicKey,
  multisigAddress: PublicKey,
): Promise<PublicKey> {
  const [multisigSigner, nonce] = await PublicKey.findProgramAddress(
    [multisigAddress.toBuffer()],
    multisigProgram,
  )
  return multisigSigner
}

export function solanaProviderFromEnv() {
  const provider = Provider.env()
  return new SolanaProvider(
    provider.connection,
    new SingleConnectionBroadcaster(provider.connection),
    provider.wallet,
  )
}

export async function getMultisigContext(
  program: Program,
  multisigAddress: PublicKey,
): Promise<MultisigContext> {
  return {
    provider: solanaProviderFromEnv(),
    multisigProg: program,
    multisig: multisigAddress,
    multisigPDA: await findMultisigSigner(program.programId, multisigAddress),
  }
}

export function assertProposerIsOwnerOfMultisig(
  proposerPubkey: PublicKey,
  multisig: MultisigStruct,
) {
  for (const owner of multisig.owners) {
    if (owner.equals(proposerPubkey)) {
      return
    }
  }
  throw Error(`${proposerPubkey.toBase58()} is not owner of multisig`)
}

//copied from anchor
export class NodeWallet implements Wallet {
  constructor(readonly payer: Keypair) {}
  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer)
    return tx
  }
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer)
      return t
    })
  }
  get publicKey(): PublicKey {
    return this.payer.publicKey
  }
}

/** better json print for PublicKey */
export function setupJSONPrint(publicKeyClass: any) {
  publicKeyClass.prototype["toJSON"] = function () {
    return this.toBase58()
  }

  publicKeyClass.prototype[util.inspect.custom] = function () {
    return this.toBase58()
  }
}

export function ensureProposalsMemoUnique(proposals: ProposalBase[]) {
  const memos = new Set<string>()
  for (const proposal of proposals) {
    if (memos.has(proposal.memo)) {
      throw Error(`duplicated memo for multisig transactions: ${proposal.memo}`)
    }
    memos.add(proposal.memo)
  }
}

/**
 * console log publicKey like
 *  ` {
        "_bn": "83b2e6cdef2e3686db68c8b5b144e7e3bdc8b445eb19fc04aa046b794d11d0bb"
      },`
 * this function try to avoid this by convert public key to base58 string
 */
export function betterPrintObjectWithPublicKey(obj) {
  console.log(JSON.stringify(betterPublicKeyJSONObject(obj), null, "  "))
}

function betterPublicKeyJSONObject(obj) {
  const newObject = new Object()
  for (const key in obj) {
    const f = obj[key]

    //for error: TypeError: Cannot read property 'toBase58' of null
    if (!f) {
      newObject[key] = obj[key]
      continue
    }

    if (f["toBase58"]) {
      newObject[key] = f.toBase58()
      continue
    }
    if (typeof f === "object") {
      newObject[key] = betterPublicKeyJSONObject(f)
      continue
    }
    newObject[key] = f
  }
  return newObject
}

export function printProposalCreationState(status: Map<string, string>) {
  console.clear()
  for (const [key, state] of status.entries()) {
    console.log(`${key} => ${state}`)
  }
}
