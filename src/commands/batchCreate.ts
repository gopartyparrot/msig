import { AccountInfo, Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import chalk from "chalk"
import { fromByteArray } from "base64-js"
import {
  assertProposerIsOwnerOfMultisig,
  betterPrintObjectWithPublicKey,
  ensureProposalsMemoUnique,
  printKeys,
} from "../utils"
import { ProposalBase } from "../instructions/ProposalBase"
import { MultisigContext } from "../types"
import { RetriableTransactionEnvelope } from "@parrotfi/common"
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
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i]
    const txAccount = txAccounts[i]
    const txAccountInfo = txAccountsInfo[i]
    await createTx(ctx, proposerPubkey, prop, txAccount, txAccountInfo, dryRun)
  }
}

async function createTx(
  ctx: MultisigContext,
  proposerPubkey: PublicKey,
  proposal: ProposalBase,
  txAccount: Keypair,
  txAccountInfo: AccountInfo<Buffer>,
  dryRun: boolean,
) {
  const accountNotExist = !txAccountInfo || txAccountInfo.lamports == 0
  const accountEmpty =
    accountNotExist || txAccountInfo.data.toString("hex").replaceAll("0", "").length === 0
  console.log({
    accountNotExist,
    accountEmpty,
  })
  if (!accountEmpty) {
    console.log(
      chalk.green(`ALREADY CREATED: `),
      proposal.memo,
      chalk.grey(" => "),
      proposal.calcTransactionAccount().publicKey.toBase58(),
    )
    return
  }
  const instrs = await proposal.createInstr(ctx)
  const ix = instrs.multisigInstr
  const instructions: web3.TransactionInstruction[] = instrs.prepare.instructions ?? []
  const signers: web3.Signer[] = instrs.prepare.signers ?? []

  if (dryRun) {
    console.log("multisig instr:")
    console.log("programId:", ix.programId.toBase58())
    console.log("data:", ix.data)
    console.log("accounts:")
    printKeys(ix.keys)
    return
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
    console.log("create tx: ", txAccount.publicKey.toBase58())
    betterPrintObjectWithPublicKey(proposal)
    printKeys(ix.keys)
    console.log("local created instr in base64: ", fromByteArray(ix.data))
  }

  const txEnvelope = new RetriableTransactionEnvelope(ctx.provider, instructions, signers)
  const receipts = await txEnvelope.confirmAll({ resend: 100, commitment: "finalized" })
  const signatures: string[] = []
  for (const receipt of receipts) {
    signatures.push(receipt.signature)
  }

  console.log(`create multisig in ${signatures.length} txid:`, signatures)
}
