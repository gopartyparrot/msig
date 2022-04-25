"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferToken = void 0;
const spl_token_1 = require("@solana/spl-token");
const ProposalBase_1 = require("./ProposalBase");
class TransferToken extends ProposalBase_1.ProposalBase {
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
            multisigInstr: spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, this.accounts.source, this.accounts.destination, ctx.multisigPDA, [], this.amount),
        };
    }
}
exports.TransferToken = TransferToken;
//# sourceMappingURL=TransferToken.js.map