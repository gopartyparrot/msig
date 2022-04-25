"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultisigSetOwnersAndChangeThreshold = void 0;
const anchor_1 = require("@project-serum/anchor");
const ProposalBase_1 = require("./ProposalBase");
class MultisigSetOwnersAndChangeThreshold extends ProposalBase_1.ProposalBase {
    memo;
    owners;
    threshold;
    constructor(memo, owners, threshold) {
        super(memo, owners);
        this.memo = memo;
        this.owners = owners;
        this.threshold = threshold;
    }
    async createInstr(ctx) {
        const multisigInstr = ctx.multisigProg.instruction.setOwnersAndChangeThreshold(this.owners, new anchor_1.BN(this.threshold), {
            accounts: {
                multisig: ctx.multisig,
                multisigSigner: ctx.multisigPDA,
            },
        });
        return { multisigInstr };
    }
}
exports.MultisigSetOwnersAndChangeThreshold = MultisigSetOwnersAndChangeThreshold;
//# sourceMappingURL=MultisigSetOwnersAndChangeThreshold.js.map