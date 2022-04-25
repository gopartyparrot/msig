"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenMintToOwner = void 0;
const spl_token_1 = require("@solana/spl-token");
const ProposalBase_1 = require("./ProposalBase");
// mint(0) -> dest(1) -> owner authority(2, multisig PDA)
class TokenMintToOwner extends ProposalBase_1.ProposalBase {
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
        const associatedTokenAddress = await spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, this.accounts.mint, this.accounts.owner, true);
        const ret = {
            multisigInstr: spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, this.accounts.mint, associatedTokenAddress, ctx.multisigPDA, [], this.amount),
        };
        const solBalance = await ctx.multisigProg.provider.connection.getBalance(associatedTokenAddress);
        if (solBalance === 0) {
            ret.prepare = {
                instructions: [
                    await spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, this.accounts.mint, associatedTokenAddress, this.accounts.owner, ctx.multisigProg.provider.wallet.publicKey),
                ],
            };
        }
        return ret;
    }
}
exports.TokenMintToOwner = TokenMintToOwner;
//# sourceMappingURL=TokenMintToOwner.js.map