import { PublicKey, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js"
import chalk from "chalk"
import { fromByteArray } from "base64-js"
import {
  assertProposerIsOwnerOfMultisig,
  betterPrintObjectWithPublicKey,
  ensureProposalsMemoUnique,
  printKeys,
  sleep,
} from "../utils"
import { ProposalBase } from "../instructions/ProposalBase"
import { MultisigContext } from "../types"

/// create configured multisig tx
export async function batchCreateProposals(
  ctx: MultisigContext,
  proposals: ProposalBase[],
  smallTransaction: boolean, //if encountered error: Transaction too large, use true
  drayRun: boolean,
) {
  if (smallTransaction) {
    console.log("use smallTransaction")
  }

  const multisigProg = ctx.multisigProg
  ensureProposalsMemoUnique(proposals)
  const proposerPubkey = multisigProg.provider.wallet.publicKey
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey)
  const multipleAccounts = await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys)
  const multisigState: any = await multisigProg.account.multisig.fetch(ctx.multisig)
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState)
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i]
    if (multipleAccounts[i] && multipleAccounts[i].lamports > 0) {
      console.log(
        chalk.green(`ALREADY CREATED: `),
        prop.memo,
        chalk.grey(" => "),
        prop.calcTransactionAccount().publicKey.toBase58(),
      )
      continue
    }
    await createTx(ctx, proposerPubkey, prop, smallTransaction, drayRun)
  }
}

async function createTx(
  ctx: MultisigContext,
  proposerPubkey: PublicKey,
  proposal: ProposalBase,
  smallTransaction: boolean,
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

  if (smallTransaction) {
    //first send prepare instructions
    const prepareTxid = await ctx.multisigProg.provider.send(
      new Transaction().add(
        ...(instrs.prepare?.instructions || []),
        await (ctx.multisigProg.account.transaction.createInstruction as any)(transaction, txSize),
      ),
      [...(instrs.prepare?.signers || []), transaction],
    )
    console.log("prepare txid:", prepareTxid)

    for (;;) {
      console.log("check transaction account created successfully")
      const transactionAccountSolBalance = await ctx.multisigProg.provider.connection.getBalance(
        transaction.publicKey,
      )
      if (transactionAccountSolBalance > 0) {
        console.log("wait 3s to ensure transaction created")
        await sleep(3 * 1000)
        break
      }
    }

    //then send create multisig transaction instruction
    const txid = await ctx.multisigProg.rpc.createTransaction(ix.programId, ix.keys, ix.data, {
      accounts: {
        multisig: ctx.multisig,
        transaction: transaction.publicKey,
        proposer: proposerPubkey,
        rent: SYSVAR_RENT_PUBKEY,
      },
    })
    console.log("create multisig txid:", txid)
  } else {
    const txid = await ctx.multisigProg.rpc.createTransaction(ix.programId, ix.keys, ix.data, {
      accounts: {
        multisig: ctx.multisig,
        transaction: transaction.publicKey,
        proposer: proposerPubkey,
        rent: SYSVAR_RENT_PUBKEY,
      },
      instructions: [
        ...(instrs.prepare?.instructions || []),
        await (ctx.multisigProg.account.transaction.createInstruction as any)(transaction, txSize),
      ],
      signers: [...(instrs.prepare?.signers || []), transaction],
    })
    console.log("create multisig txid:", txid)
  }
}
