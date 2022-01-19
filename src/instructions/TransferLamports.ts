import { PublicKey, SystemProgram } from "@solana/web3.js";
import { MultisigContext } from "../types";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";

export class TransferLamports extends ProposalBase {
  constructor(
    public memo: string,
    public receiver: PublicKey,
    public lamports: number,
  ) {
    super(memo, [receiver]);
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    return {
      multisigInstr: SystemProgram.transfer({
        fromPubkey: ctx.multisigPDA,
        toPubkey: this.receiver,
        lamports: this.lamports,
      }),
    };
  }
}
