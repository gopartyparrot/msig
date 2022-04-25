"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenMintTo = void 0;
const spl_token_1 = require("@solana/spl-token");
const ProposalBase_1 = require("./ProposalBase");
// mint(0) -> dest(1) -> owner authority(2, multisig PDA)
class TokenMintTo extends ProposalBase_1.ProposalBase {
    memo;
    accounts;
    amount;
    constructor(memo, accounts, amount) {
        super(memo, accounts);
        this.memo = memo;
        this.accounts = accounts;
        this.amount = amount;
    }
    async createInstr(ctx) {
        return {
            multisigInstr: spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, this.accounts.mint, this.accounts.destination, ctx.multisigPDA, [], this.amount),
        };
    }
}
exports.TokenMintTo = TokenMintTo;
//# sourceMappingURL=TokenMintTo.js.map