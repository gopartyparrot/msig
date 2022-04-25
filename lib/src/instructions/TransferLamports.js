"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferLamports = void 0;
const web3_js_1 = require("@solana/web3.js");
const ProposalBase_1 = require("./ProposalBase");
class TransferLamports extends ProposalBase_1.ProposalBase {
    memo;
    receiver;
    lamports;
    constructor(memo, receiver, lamports) {
        super(memo, [receiver]);
        this.memo = memo;
        this.receiver = receiver;
        this.lamports = lamports;
    }
    async createInstr(ctx) {
        return {
            multisigInstr: web3_js_1.SystemProgram.transfer({
                fromPubkey: ctx.multisigPDA,
                toPubkey: this.receiver,
                lamports: this.lamports,
            }),
        };
    }
}
exports.TransferLamports = TransferLamports;
//# sourceMappingURL=TransferLamports.js.map