"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeProposals = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../utils");
const batchCreate_1 = require("./batchCreate");
async function executeProposals(proposal, opts = {}) {
    const env = {
        multisigProgram: new web3_js_1.PublicKey(process.env.MULTISIG_PROGRAM || "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"),
        ...opts,
    };
    await (0, batchCreate_1.batchCreateProposals)(await (0, utils_1.getMultisigContext)((0, utils_1.getProgramFromEnv)(env), proposal.multisig), proposal.transactions, opts.dryRun);
}
exports.executeProposals = executeProposals;
//# sourceMappingURL=executeProposals.js.map