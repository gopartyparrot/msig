import { PublicKey, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js"
import chalk from "chalk"
import { fromByteArray } from "base64-js"
import {
  assertProposerIsOwnerOfMultisig,
  betterPrintObjectWithPublicKey,
  ensureProposalsMemoUnique,
  getMultisigContext,
  printKeys,
  sleep,
} from "../utils"
import { ProposalBase } from "../instructions/ProposalBase"
import { MultisigContext } from "../types"
import { RetriableTransactionEnvelope } from "@parrotfi/common"
import { ButlerLike } from "../bin/cli"
import { web3 } from "@project-serum/anchor"

export async function batchPrepare(ctx: MultisigContext, butler: ButlerLike, dryRun: boolean) {
  const prepareOps = await butler.prepareOps()
  for (const allow of Object.keys(prepareOps)) {
    const ops = prepareOps[allow]

    for (const prepare of ops) {
      await executePrepareInstructions(ctx, prepare, dryRun)
    }
  }
}

export async function executePrepareInstructions(
  ctx: MultisigContext,
  instructions: web3.TransactionInstruction[],
  dryRun: boolean,
) {
  if (instructions.length === 0) {
    return
  }
  const provider = ctx.provider
  const txEnvelop = new RetriableTransactionEnvelope(provider, instructions)
  if (dryRun) {
    const res = await txEnvelop.simulate()
    console.log("dry run:")
    console.log(res)
    return
  }
  const receipts = await txEnvelop.confirmAll({ resend: 3 })
  const signatures: string[] = []
  for (const receipt of receipts) {
    signatures.push(receipt.signature)
  }

  console.log(`prepare executed in ${signatures.length} txid:`, signatures)
}

/// create configured multisig tx
export async function batchCreateProposals(
  ctx: MultisigContext,
  butler: ButlerLike,
  dryRun: boolean,
) {
  const proposals = await butler.proposals()
  const multisigProg = ctx.multisigProg
  ensureProposalsMemoUnique(proposals)
  const proposerPubkey = multisigProg.provider.wallet.publicKey
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey)
  const multipleAccounts = await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys)
  const multisigState: any = await multisigProg.account.multisig.fetch(ctx.multisig)
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState)
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i]
    const multipleAccountsEmpty = multipleAccounts[i] && multipleAccounts[i].lamports > 0
    // TODO init multisig if account data is empty
    // && multipleAccounts[i].data.toString("hex").replaceAll("0", "").length === 0
    if (multipleAccountsEmpty) {
      console.log(
        chalk.green(`ALREADY CREATED: `),
        prop.memo,
        chalk.grey(" => "),
        prop.calcTransactionAccount().publicKey.toBase58(),
      )
      continue
    }
    await createTx(ctx, proposerPubkey, prop, dryRun)
  }
}

async function createTx(
  ctx: MultisigContext,
  proposerPubkey: PublicKey,
  proposal: ProposalBase,
  drayRun: boolean,
) {
  const transaction = proposal.calcTransactionAccount()
  const instrs = await proposal.createInstr(ctx)
  const ix = instrs.multisigInstr

  console.log("create tx: ", transaction.publicKey.toBase58())
  betterPrintObjectWithPublicKey(proposal)
  printKeys(ix.keys)
  console.log("local created instr in base64: ", fromByteArray(ix.data))

  if (drayRun) {
    console.log("multisig instr:")
    console.log("programId:", ix.programId.toBase58())
    console.log("data:", ix.data)
    console.log("accounts:")
    printKeys(ix.keys)
    return
  }
  const txSize = 100 + 34 * ix.keys.length + ix.data.length

  const instruction = await ctx.multisigProg.instruction.createTransaction(
    ix.programId,
    ix.keys,
    ix.data,
    {
      accounts: {
        multisig: ctx.multisig,
        transaction: transaction.publicKey,
        proposer: proposerPubkey,
        rent: SYSVAR_RENT_PUBKEY,
      },
    },
  )
  const txEnvelope = new RetriableTransactionEnvelope(
    ctx.provider,
    [
      ...(instrs.prepare?.instructions || []),
      await (ctx.multisigProg.account.transaction.createInstruction as any)(transaction, txSize),
      instruction,
    ],
    [...(instrs.prepare?.signers || []), transaction],
  )
  const receipts = await txEnvelope.confirmAll({ resend: 3, commitment: "finalized" })
  const signatures: string[] = []
  for (const receipt of receipts) {
    signatures.push(receipt.signature)
  }

  console.log(`create multisig in ${signatures.length} txid:`, signatures)
}
