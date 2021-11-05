import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import chalk from "chalk";
import {
  assertProposerIsOwnerOfMultisig,
  getProposalsChainStates,
} from "../common/utils";
import { ProposalBase } from "../instructions/ProposalBase";
import {
  IEnvPublicKeys,
  MultisigContext,
  MultisigStruct,
  MultisigTransactionStruct,
} from "../instructions/types";
import { PROPOSALS } from "../proposals";

import { verify } from "./batchVerify";

export async function batchApproveExecute(
  multisigProg: Program,
  accounts: IEnvPublicKeys,
  verbose: boolean
) {
  const proposerPubkey = multisigProg.provider.wallet.publicKey;
  const proposals = PROPOSALS;
  const chainTransactions = await getProposalsChainStates(
    multisigProg,
    proposals
  );

  const multisigState: MultisigStruct =
    (await multisigProg.account.multisig.fetch(accounts.multisig)) as any;
  assertProposerIsOwnerOfMultisig(proposerPubkey, multisigState);

  const ctx = {
    multisigProg: multisigProg,
    multisigPDA: accounts.multisigSigner,
  };
  for (let i = 0; i < proposals.length; i++) {
    const prop = proposals[i];
    const chainTx = chainTransactions[i];
    console.log(
      `=======>> approve/execute ${prop.memo} ${chainTx.pubkey.toBase58()}`
    );
    if (chainTx.state == null) {
      console.log(chalk.red(` not created, continue`));
      continue;
    }
    if (chainTx.state.didExecute) {
      console.log(chalk.grey(` did executed, skip approve/execute, continue`));
      continue;
    }

    const currentSignerIndex = multisigState.owners.findIndex((x) =>
      x.equals(proposerPubkey)
    );
    const isCurrentProposerApproved = chainTx.state.signers[currentSignerIndex];
    const approvedCount = chainTx.state.signers.filter((x) => x).length;

    await approveExecute(
      ctx,
      accounts.multisig,
      prop,
      chainTx.state,
      proposerPubkey,
      {
        needApprove: !isCurrentProposerApproved,
        needExecute:
          multisigState.threshold - approvedCount ===
          (isCurrentProposerApproved ? 0 : 1),
      },
      verbose
    );
  }
}

async function approveExecute(
  ctx: MultisigContext,
  multisigPubkey: PublicKey,
  proposal: ProposalBase,
  chainTxState: MultisigTransactionStruct,
  proposerPubkey: PublicKey,
  options: {
    needApprove: boolean;
    needExecute: boolean;
  },
  verbose: boolean
) {
  if (!options.needApprove && !options.needExecute) {
    console.log(chalk.red("you have approved, and more approves wanted"));
    return;
  }
  await verify(ctx, proposal, chainTxState, verbose); //verify first

  const txKeypair = proposal.calcTransactionAccount();
  const instrs: TransactionInstruction[] = [];
  if (options.needApprove) {
    instrs.push(
      ctx.multisigProg.instruction.approve({
        accounts: {
          multisig: multisigPubkey,
          transaction: txKeypair.publicKey,
          owner: proposerPubkey,
        },
        // signers: [signer]
      })
    );
  }
  if (options.needExecute) {
    instrs.push(
      ctx.multisigProg.instruction.executeTransaction({
        accounts: {
          multisig: multisigPubkey,
          multisigSigner: ctx.multisigPDA,
          transaction: txKeypair.publicKey,
        },
        remainingAccounts: chainTxState.accounts
          .map((t: any) => {
            if (t.pubkey.equals(ctx.multisigPDA)) {
              return { ...t, isSigner: false };
            }
            return t;
          })
          .concat({
            pubkey: chainTxState.programId,
            isWritable: false,
            isSigner: false,
          }),
      })
    );
  }
  const txid = await ctx.multisigProg.provider.send(
    new Transaction().add(...instrs)
  );
  console.log("execute txid:", txid);
}
