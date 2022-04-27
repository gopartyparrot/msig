"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProposal = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../utils");
const batchApproveExecute_1 = require("./batchApproveExecute");
const batchCreate_1 = require("./batchCreate");
const batchVerify_1 = require("./batchVerify");
async function runProposal(proposal, action, opts = {}) {
    const env = {
        multisigProgram: new web3_js_1.PublicKey(opts.multisigProgram ?? process.env.MULTISIG_PROGRAM),
    };
    const ctx = await (0, utils_1.getMultisigContext)((0, utils_1.getProgramFromEnv)(env), proposal.multisig);
    switch (action) {
        case "verify":
            await (0, batchVerify_1.batchVerifyProposals)(ctx, proposal.transactions, opts.verbose);
            break;
        case "create":
            await (0, batchCreate_1.batchCreateProposals)(ctx, proposal.transactions, opts.dryRun);
            break;
        case "approve":
        case "execute":
            await (0, batchApproveExecute_1.batchApproveExecuteProposals)(ctx, proposal.transactions, opts.skipExecute, opts.verbose);
            break;
        default:
            break;
    }
}
exports.runProposal = runProposal;
//# sourceMappingURL=runProposal.js.map