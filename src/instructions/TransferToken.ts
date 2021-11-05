import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "./types";

export class TransferToken extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      source: PublicKey;
      destination: PublicKey;
    },
    public amount: u64
  ) {
    super(memo, accounts);
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    return {
      multisigInstr: Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        this.accounts.source,
        this.accounts.destination,
        ctx.multisigPDA,
        [],
        this.amount
      ),
    };
  }
}
