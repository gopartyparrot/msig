import { Program } from "@project-serum/anchor";
import { AccountInfo, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as browserBuffer from "buffer";
import chalk from "chalk";
import { encode } from "js-base64";
import {
  assertProposerIsOwnerOfMultisig,
  printKeys,
  sleep,
} from "../common/utils";
import { ProposalBase } from "../instructions/ProposalBase";
import { IEnvPublicKeys, MultisigContext } from "../instructions/types";
import { PROPOSALS } from "../proposals";

/// create configured multisig tx
export async function batchCreate(
  multisigProg: Program,
  accounts: IEnvPublicKeys
) {
  const proposals = PROPOSALS;
  const proposerPubkey = multisigProg.provider.wallet.publicKey;
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey);
  const multipleAccounts =
    await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys);

  const multisigState: any = await multisigProg.account.multisig.fetch(
    accounts.multisig
  );
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState);
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i];
    if (
      multipleAccounts[i] &&
      (multipleAccounts[i] as AccountInfo<Buffer>).lamports > 0
    ) {
      console.log(
        chalk.green(`ALREADY CREATED: `),
        prop.memo,
        chalk.grey(" => "),
        prop.calcTransactionAccount().publicKey.toBase58()
      );
      continue;
    }
    await createTx(
      {
        multisigProg: multisigProg,
        multisigPDA: accounts.multisigSigner,
      },
      proposerPubkey,
      accounts.multisig,
      prop
    );
  }
}

async function createTx(
  ctx: MultisigContext,
  proposerPubkey: PublicKey,
  multisigPubkey: PublicKey,
  proposal: ProposalBase
) {
  const transaction = proposal.calcTransactionAccount();
  const instrs = await proposal.createInstr(ctx);
  const ix = instrs.multisigInstr;

  console.log(
    "will create tx for: ",
    transaction.publicKey.toBase58(),
    JSON.stringify(proposal, null, "  ")
  );
  printKeys(ix.keys);
  console.log(
    "local created instr in base64(should same as UI): ",
    encode(browserBuffer.Buffer.from(ix.data).toString())
  );
  console.log("you have 10s to check instruction");
  await sleep(10 * 1000);

  const txSize = 100 + 34 * ix.keys.length + ix.data.length;
  const txid = await ctx.multisigProg.rpc.createTransaction(
    ix.programId,
    ix.keys,
    ix.data,
    {
      accounts: {
        multisig: multisigPubkey,
        transaction: transaction.publicKey,
        proposer: proposerPubkey,
        rent: SYSVAR_RENT_PUBKEY,
      },
      instructions: [
        ...(instrs.prepare?.instructions || []),
        await (ctx.multisigProg.account.transaction.createInstruction as any)(
          transaction,
          txSize
        ),
      ],
      signers: [...(instrs.prepare?.signers || []), transaction],
    }
  );
  console.log("create multisig txid:", txid);
}
