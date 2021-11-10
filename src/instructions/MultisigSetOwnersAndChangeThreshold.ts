import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { ProposalBase } from "./ProposalBase";
import { MultisigContext } from "../types";
import { TransactionInstructionExt } from "./ProposalBase";

export class MultisigSetOwnersAndChangeThreshold extends ProposalBase {
  constructor(
    public memo: string,
    public owners: PublicKey[],
    public threshold: number,
  ) {
    super(memo, owners);
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    const multisigInstr =
      ctx.multisigProg.instruction.setOwnersAndChangeThreshold(
        this.owners,
        new BN(this.threshold),
        {
          accounts: {
            multisig: ctx.multisig,
            multisigSigner: ctx.multisigPDA,
          },
        },
      );
    return { multisigInstr };
  }
}
