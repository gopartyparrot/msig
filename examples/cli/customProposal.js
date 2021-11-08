const { ProposalBase } = require('@parrotfi/msig')
const { TOKEN_PROGRAM_ID, Token } = require("@solana/spl-token");

class CustomTokenBurn extends ProposalBase {
  constructor(
    memo, accounts, amount
  ) {
    super(memo, accounts);
    this.memo = memo;
    this.accounts = accounts;
    this.amount = amount;
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
      )
    }
  }
}

module.exports = CustomTokenBurn