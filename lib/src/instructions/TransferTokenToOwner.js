"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferTokenToOwner = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const ProposalBase_1 = require("./ProposalBase");
class TransferTokenToOwner extends ProposalBase_1.ProposalBase {
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
        const mint = this.accounts.mint;
        const fromAssociatedTokenAddress = await spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, ctx.multisigPDA, true);
        const toAssociatedTokenAddress = await spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, this.accounts.toOwner, true);
        const ret = {
            multisigInstr: spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, fromAssociatedTokenAddress, toAssociatedTokenAddress, ctx.multisigPDA, [], this.amount),
        };
        const solBalance = await ctx.multisigProg.provider.connection.getBalance(toAssociatedTokenAddress);
        if (solBalance === 0) {
            ret.prepare = {
                instructions: [
                    await spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, toAssociatedTokenAddress, this.accounts.toOwner, ctx.multisigProg.provider.wallet.publicKey),
                ],
            };
        }
        return ret;
    }
    async getTokenAccountMint(conn, tokenAcc) {
        const info = await conn.getAccountInfo(tokenAcc, "confirmed");
        if (!info) {
            throw Error("token account not found for:" + tokenAcc.toBase58());
        }
        const accountInfo = spl_token_1.AccountLayout.decode(Buffer.from(info.data));
        return new web3_js_1.PublicKey(accountInfo.mint);
    }
}
exports.TransferTokenToOwner = TransferTokenToOwner;
//# sourceMappingURL=TransferTokenToOwner.js.map