import { PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as browserBuffer from "buffer";
import chalk from "chalk";
import { encode } from "js-base64";
import {
  assertProposerIsOwnerOfMultisig,
  ensureProposalsMemoUnique,
  printKeys,
  sleep,
} from "../utils";
import { ProposalBase } from "../instructions/ProposalBase";
import { MultisigContext } from "../types";

/// create configured multisig tx
export async function batchCreateProposals(
  ctx: MultisigContext,
  proposals: ProposalBase[],
) {
  const multisigProg = ctx.multisigProg;
  ensureProposalsMemoUnique(proposals);
  const proposerPubkey = multisigProg.provider.wallet.publicKey;
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey);
  const multipleAccounts =
    await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys);
  const multisigState: any = await multisigProg.account.multisig.fetch(
    ctx.multisig,
  );
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState);
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i];
    if (multipleAccounts[i] && multipleAccounts[i].lamports > 0) {
      console.log(
        chalk.green(`ALREADY CREATED: `),
        prop.memo,
        chalk.grey(" => "),
        prop.calcTransactionAccount().publicKey.toBase58(),
      );
      continue;
    }
    await createTx(ctx, proposerPubkey, prop);
  }
}

async function createTx(
  ctx: MultisigContext,
  proposerPubkey: PublicKey,
  proposal: ProposalBase,
) {
  const transaction = proposal.calcTransactionAccount();
  const instrs = await proposal.createInstr(ctx);
  const ix = instrs.multisigInstr;

  console.log(
    "create tx: ",
    transaction.publicKey.toBase58(),
    JSON.stringify(proposal, null, "  "),
  );
  printKeys(ix.keys);
  console.log(
    "local created instr in base64(should same as UI): ",
    encode(browserBuffer.Buffer.from(ix.data).toString()),
  );

  const txSize = 100 + 34 * ix.keys.length + ix.data.length;
  const txid = await ctx.multisigProg.rpc.createTransaction(
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
      instructions: [
        ...(instrs.prepare?.instructions || []),
        await (ctx.multisigProg.account.transaction.createInstruction as any)(
          transaction,
          txSize,
        ),
      ],
      signers: [...(instrs.prepare?.signers || []), transaction],
    },
  );
  console.log("create multisig txid:", txid);
}
