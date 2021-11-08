import { Program, Provider, Wallet } from "@project-serum/anchor";
import {
  AccountInfo,
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { ENV } from "./env";
import { ProposalBase } from "./instructions/ProposalBase";
import {
  IEnvPublicKeys,
  MultisigStruct,
  MultisigTransactionStruct,
} from "./types";
import util from "util";

import multisigIdl from "./serum_multisig_idl.json";

export function printKeys(keys: Array<AccountMeta>) {
  const bs = (b: boolean): string => (b ? "y" : "n"); //bool string
  const pk = (k: PublicKey): string => k.toBase58().padEnd(45, " "); //pad pubkey
  for (let i = 0; i < keys.length; i++) {
    const { pubkey, isWritable, isSigner } = keys[i];
    console.log(`${i}  ${pk(pubkey)} w: ${bs(isWritable)} s: ${bs(isSigner)}`);
  }
  console.log("");
}

export async function fetchProposalsChainStates(
  multisigProg: Program,
  proposals: ProposalBase[]
): Promise<(AccountInfo<MultisigTransactionStruct> | null)[]> {
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey);
  const chainTransactions: (AccountInfo<MultisigTransactionStruct> | null)[] = (
    await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys)
  ).map((acc, idx): AccountInfo<MultisigTransactionStruct> => {
    return !acc
      ? null
      : {
          ...acc,
          data: multisigProg.coder.accounts.decode("Transaction", acc.data),
        };
  });
  return chainTransactions;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildMultisigProgram(
  rpc: string,
  multisigProgramId: PublicKey,
  wallet: Keypair,
  opts = Provider.defaultOptions()
): Program {
  const connection = new Connection(rpc, opts.preflightCommitment);
  const provider = new Provider(connection, new NodeWallet(wallet), opts);
  return new Program(multisigIdl as any, multisigProgramId, provider);
}

export function getWalletFromEnv(): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        readFileSync(ENV.wallet, {
          encoding: "utf-8",
        })
      )
    )
  );
}
export function getProgramFromEnv(): Program {
  return buildMultisigProgram(
    ENV.rpcUrl,
    ENV.multisigProgram,
    getWalletFromEnv()
  );
}

export async function findMultisigSigner(
  multisigProgram: PublicKey,
  multisigAddress: PublicKey
): Promise<PublicKey> {
  const [multisigSigner, nonce] = await PublicKey.findProgramAddress(
    [multisigAddress.toBuffer()],
    multisigProgram
  );
  return multisigSigner;
}

export async function getEnvPublicKeys(
  multisigAddress: PublicKey
): Promise<IEnvPublicKeys> {
  return {
    multisig: multisigAddress,
    multisigSigner: await findMultisigSigner(
      ENV.multisigProgram,
      multisigAddress
    ),
  };
}

export function assertProposerIsOwnerOfMultisig(
  proposerPubkey: PublicKey,
  multisig: MultisigStruct
) {
  for (const owner of multisig.owners) {
    if (owner.equals(proposerPubkey)) {
      return;
    }
  }
  throw Error(`${proposerPubkey.toBase58()} is not owner of multisig`);
}

//copied from anchor
export class NodeWallet implements Wallet {
  constructor(readonly payer: Keypair) {}
  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }
  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}

/** better json print for PublicKey */
export function setupJSONPrint() {
  PublicKey.prototype["toJSON"] = function () {
    return this.toBase58();
  };

  PublicKey.prototype[util.inspect.custom] = function () {
    return this.toBase58();
  };
}

export function ensureProposalsMemoUnique(proposals: ProposalBase[]) {
  if (new Set(proposals.map((x) => x.memo)).size != proposals.length) {
    throw Error("duplicated memo for multisig transactions");
  }
}
