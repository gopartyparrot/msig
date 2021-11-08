import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { ProposalBase } from "@parrotfi/msig";

export class CustomTokenBurn extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      mint: PublicKey;
      burnFrom: PublicKey;
    },
    public amount: u64
  ) {
    super(memo, accounts);
  }

  async createInstr(ctx) {
    return {
      multisigInstr: Token.createBurnInstruction(
        TOKEN_PROGRAM_ID,
        this.accounts.mint,
        this.accounts.burnFrom,
        ctx.multisigPDA,
        [],
        this.amount
      ),
    };
  }
}
