"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.batchVerifyProposals = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils");
/// verify configured multisig tx
async function batchVerifyProposals(ctx, proposals, verbose) {
    const multisigProg = ctx.multisigProg;
    (0, utils_1.ensureProposalsMemoUnique)(proposals);
    const chainTransactions = await (0, utils_1.fetchProposalsChainStates)(multisigProg, proposals);
    for (let i = 0; i < proposals.length; i++) {
        const prop = proposals[i];
        const chainTx = chainTransactions[i];
        if (chainTx == null) {
            console.log(prop.memo, chalk_1.default.yellow(`not yet created, skip verify`));
            continue;
        }
        if (chainTx.data.didExecute) {
            console.log(prop.memo, chalk_1.default.grey(`already executed, skip verify`));
            continue;
        }
        await verify(ctx, prop, chainTx.data, verbose);
    }
}
exports.batchVerifyProposals = batchVerifyProposals;
async function verify(ctx, proposal, chainTxState, verbose) {
    const tx = proposal.calcTransactionAccount().publicKey;
    console.log(`=======>> verify ${proposal.memo} ${tx.toBase58()}`);
    await proposal.verifyTx(ctx, chainTxState, verbose);
    console.log(chalk_1.default.green(` PASSED`));
}
exports.verify = verify;
//# sourceMappingURL=batchVerify.js.map