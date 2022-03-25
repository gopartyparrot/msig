import { AccountInfo, Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import chalk from "chalk"
import { fromByteArray } from "base64-js"
import {
  assertProposerIsOwnerOfMultisig,
  betterPrintObjectWithPublicKey,
  ensureProposalsMemoUnique,
  printKeys,
  printProposalCreationState,
} from "../utils"
import { ProposalBase } from "../instructions/ProposalBase"
import { MultisigContext } from "../types"
import { RetriableTransactionEnvelope, sleep } from "@parrotfi/common"
import { web3 } from "@project-serum/anchor"

/// create configured multisig tx
export async function batchCreateProposals(
  ctx: MultisigContext,
  proposals: ProposalBase[],
  dryRun: boolean,
) {
  const multisigProg = ctx.multisigProg
  ensureProposalsMemoUnique(proposals)
  const proposerPubkey = multisigProg.provider.wallet.publicKey
  const txAccounts = proposals.map((p) => p.calcTransactionAccount())
  const txAccountsInfo = await multisigProg.provider.connection.getMultipleAccountsInfo(
    txAccounts.map((acc) => acc.publicKey),
  )
  const multisigState: any = await multisigProg.account.multisig.fetch(ctx.multisig)
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState)
  const status: Map<string, string> = new Map<string, string>()
  const promises = proposals.map(async (_, i) => {
    const prop = proposals[i]
    const txAccount = txAccounts[i]
    const txAccountInfo = txAccountsInfo[i]
    status.set(prop.memo, "pending")
    const sigs = await createTx(ctx, proposerPubkey, prop, txAccount, txAccountInfo, dryRun)
    status.set(prop.memo, sigs.toString())
  })

  const tid = setInterval(printProposalCreationState(status), 3000)
  await Promise.all(promises)
  printProposalCreationState(status)()
  clearInterval(tid)
}

async function createTx(
  ctx: MultisigContext,
  proposerPubkey: PublicKey,
  proposal: ProposalBase,
  txAccount: Keypair,
  txAccountInfo: AccountInfo<Buffer>,
  dryRun: boolean,
): Promise<string> {
  const accountNotExist = !txAccountInfo || txAccountInfo.lamports == 0
  const accountEmpty =
    accountNotExist || txAccountInfo.data.toString("hex").replaceAll("0", "").length === 0
  if (!accountEmpty) {
    return `${chalk.green(`already created: `)} ${chalk.grey(" => ")} ${proposal
      .calcTransactionAccount()
      .publicKey.toBase58()}`
  }
  const instrs = await proposal.createInstr(ctx, true)
  const ix = instrs.multisigInstr
  const instructions: web3.TransactionInstruction[] = instrs.prepare?.instructions ?? []
  const signers: web3.Signer[] = instrs.prepare?.signers ?? []

  if (dryRun) {
    console.log("multisig instr:")
    console.log("programId:", ix.programId.toBase58())
    console.log("data:", ix.data.toString("hex"))
    console.log("accounts:")
    printKeys(ix.keys)
    return "created"
  }

  if (accountNotExist) {
    const txSize = 100 + 34 * ix.keys.length + ix.data.length
    instructions.push(
      await (ctx.multisigProg.account.transaction.createInstruction as any)(txAccount, txSize),
    )
    signers.push(txAccount)
  }

  if (accountEmpty) {
    instructions.push(
      await ctx.multisigProg.instruction.createTransaction(ix.programId, ix.keys, ix.data, {
        accounts: {
          multisig: ctx.multisig,
          transaction: txAccount.publicKey,
          proposer: proposerPubkey,
          rent: SYSVAR_RENT_PUBKEY,
        },
      }),
    )
  }

  const txEnvelope = new RetriableTransactionEnvelope(ctx.provider, instructions, signers)
  const receipts = await txEnvelope.confirmAll({ resend: 100, commitment: "finalized" })
  const signatures: string[] = []
  for (const receipt of receipts) {
    signatures.push(receipt.signature)
  }

  return signatures.toString()
}
