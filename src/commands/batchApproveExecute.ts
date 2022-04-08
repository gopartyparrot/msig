import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import chalk from "chalk"
import {
  assertProposerIsOwnerOfMultisig,
  ensureProposalsMemoUnique,
  fetchProposalsChainStates,
} from "../utils"
import { ProposalBase } from "../instructions/ProposalBase"
import { MultisigContext, MultisigStruct, MultisigTransactionStruct } from "../types"

import { verify } from "./batchVerify"
import { RetriableTransactionEnvelope } from "@parrotfi/core-sdk"

export async function batchApproveExecuteProposals(
  ctx: MultisigContext,
  proposals: ProposalBase[],
  skipExecute: boolean,
  verbose: boolean,
) {
  const multisigProg = ctx.multisigProg
  ensureProposalsMemoUnique(proposals)
  const proposerPubkey = multisigProg.provider.wallet.publicKey
  const chainTransactions = await fetchProposalsChainStates(multisigProg, proposals)

  const multisigState: MultisigStruct = (await multisigProg.account.multisig.fetch(
    ctx.multisig,
  )) as any
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState)

  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i]
    const txPubkey = prop.calcTransactionAccount().publicKey
    const chainTx = chainTransactions[i]
    console.log(`======>> approve/execute ${prop.memo} ${txPubkey.toBase58()}`)
    if (chainTx == null) {
      console.log(chalk.red(` not created, continue`))
      continue
    }
    if (chainTx.data.didExecute) {
      console.log(chalk.grey(` did executed, skip approve/execute, continue`))
      continue
    }

    const currentSignerIndex = multisigState.owners.findIndex((x) => x.equals(proposerPubkey))
    const isCurrentProposerApproved = chainTx.data.signers[currentSignerIndex]
    const approvedCount = chainTx.data.signers.filter((x) => x).length

    let needExecute = skipExecute
      ? false
      : multisigState.threshold - approvedCount === (isCurrentProposerApproved ? 0 : 1)

    await approveExecute(
      ctx,
      prop,
      chainTx.data,
      proposerPubkey,
      {
        needApprove: !isCurrentProposerApproved,
        needExecute,
      },
      verbose,
    )
  }
}

async function approveExecute(
  ctx: MultisigContext,
  proposal: ProposalBase,
  chainTxState: MultisigTransactionStruct,
  proposerPubkey: PublicKey,
  options: {
    needApprove: boolean
    needExecute: boolean
  },
  verbose: boolean,
) {
  if (!options.needApprove && !options.needExecute) {
    console.log(
      chalk.red("you have approved, execute skipped (more approves wanted or with --skip-exec)"),
    )
    return
  }
  await verify(ctx, proposal, chainTxState, verbose) //verify first

  const txKeypair = proposal.calcTransactionAccount()
  const instrs: TransactionInstruction[] = []
  if (options.needApprove) {
    instrs.push(
      ctx.multisigProg.instruction.approve({
        accounts: {
          multisig: ctx.multisig,
          transaction: txKeypair.publicKey,
          owner: proposerPubkey,
        },
      }),
    )
  }
  if (options.needExecute) {
    instrs.push(
      ctx.multisigProg.instruction.executeTransaction({
        accounts: {
          multisig: ctx.multisig,
          multisigSigner: ctx.multisigPDA,
          transaction: txKeypair.publicKey,
        },
        remainingAccounts: chainTxState.accounts
          .map((t: any) => {
            if (t.pubkey.equals(ctx.multisigPDA)) {
              return { ...t, isSigner: false }
            }
            return t
          })
          .concat({
            pubkey: chainTxState.programId,
            isWritable: false,
            isSigner: false,
          }),
      }),
    )
  }
  const txEnvelope = new RetriableTransactionEnvelope(ctx.provider, instrs, [])
  const receipts = await txEnvelope.confirmAll({ resend: 100, commitment: "finalized" })

  console.log(
    "signatures: ",
    receipts.map((receipt) => receipt.signature),
  )
}
