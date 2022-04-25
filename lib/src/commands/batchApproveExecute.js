"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchApproveExecuteProposals = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils");
const batchVerify_1 = require("./batchVerify");
const core_sdk_1 = require("@parrotfi/core-sdk");
async function batchApproveExecuteProposals(ctx, proposals, skipExecute, verbose) {
    const multisigProg = ctx.multisigProg;
    (0, utils_1.ensureProposalsMemoUnique)(proposals);
    const proposerPubkey = multisigProg.provider.wallet.publicKey;
    const chainTransactions = await (0, utils_1.fetchProposalsChainStates)(multisigProg, proposals);
    const multisigState = (await multisigProg.account.multisig.fetch(ctx.multisig));
    (0, utils_1.assertProposerIsOwnerOfMultisig)(proposerPubkey, multisigState);
    for (let i = 0; i < proposals.length; i++) {
        const prop = proposals[i];
        const txPubkey = prop.calcTransactionAccount().publicKey;
        const chainTx = chainTransactions[i];
        console.log(`======>> approve/execute ${prop.memo} ${txPubkey.toBase58()}`);
        if (chainTx == null) {
            console.log(chalk_1.default.red(` not created, continue`));
            continue;
        }
        if (chainTx.data.didExecute) {
            console.log(chalk_1.default.grey(` did executed, skip approve/execute, continue`));
            continue;
        }
        const currentSignerIndex = multisigState.owners.findIndex((x) => x.equals(proposerPubkey));
        const isCurrentProposerApproved = chainTx.data.signers[currentSignerIndex];
        const approvedCount = chainTx.data.signers.filter((x) => x).length;
        let needExecute = skipExecute
            ? false
            : multisigState.threshold - approvedCount === (isCurrentProposerApproved ? 0 : 1);
        await approveExecute(ctx, prop, chainTx.data, proposerPubkey, {
            needApprove: !isCurrentProposerApproved,
            needExecute,
        }, verbose);
    }
}
exports.batchApproveExecuteProposals = batchApproveExecuteProposals;
async function approveExecute(ctx, proposal, chainTxState, proposerPubkey, options, verbose) {
    if (!options.needApprove && !options.needExecute) {
        console.log(chalk_1.default.red("you have approved, execute skipped (more approves wanted or with --skip-exec)"));
        return;
    }
    await (0, batchVerify_1.verify)(ctx, proposal, chainTxState, verbose); //verify first
    const txKeypair = proposal.calcTransactionAccount();
    const instrs = [];
    if (options.needApprove) {
        instrs.push(ctx.multisigProg.instruction.approve({
            accounts: {
                multisig: ctx.multisig,
                transaction: txKeypair.publicKey,
                owner: proposerPubkey,
            },
        }));
    }
    if (options.needExecute) {
        instrs.push(ctx.multisigProg.instruction.executeTransaction({
            accounts: {
                multisig: ctx.multisig,
                multisigSigner: ctx.multisigPDA,
                transaction: txKeypair.publicKey,
            },
            remainingAccounts: chainTxState.accounts
                .map((t) => {
                if (t.pubkey.equals(ctx.multisigPDA)) {
                    return { ...t, isSigner: false };
                }
                return t;
            })
                .concat({
                pubkey: chainTxState.programId,
                isWritable: false,
                isSigner: false,
            }),
        }));
    }
    const txEnvelope = new core_sdk_1.RetriableTransactionEnvelope(ctx.provider, instrs, []);
    const receipts = await txEnvelope.confirmAll({ resend: 100, commitment: "finalized" });
    console.log("signatures: ", receipts.map((receipt) => receipt.signature));
}
//# sourceMappingURL=batchApproveExecute.js.map