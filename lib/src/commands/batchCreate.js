"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchCreateProposals = void 0;
const web3_js_1 = require("@solana/web3.js");
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils");
const core_sdk_1 = require("@parrotfi/core-sdk");
/// create configured multisig tx
async function batchCreateProposals(ctx, proposals, dryRun) {
    const multisigProg = ctx.multisigProg;
    (0, utils_1.ensureProposalsMemoUnique)(proposals);
    const proposerPubkey = multisigProg.provider.wallet.publicKey;
    const txAccounts = proposals.map((p) => p.calcTransactionAccount());
    const txAccountsInfo = await multisigProg.provider.connection.getMultipleAccountsInfo(txAccounts.map((acc) => acc.publicKey));
    const multisigState = await multisigProg.account.multisig.fetch(ctx.multisig);
    (0, utils_1.assertProposerIsOwnerOfMultisig)(proposerPubkey, multisigState);
    const status = new Map();
    const promises = proposals.map(async (_, i) => {
        const prop = proposals[i];
        const txAccount = txAccounts[i];
        const txAccountInfo = txAccountsInfo[i];
        status.set(prop.memo, "pending");
        const sigs = await createTx(ctx, proposerPubkey, prop, txAccount, txAccountInfo, dryRun);
        status.set(prop.memo, sigs.toString());
    });
    const tid = setInterval(() => (0, utils_1.printProposalCreationState)(status), 3000);
    try {
        await Promise.all(promises);
    }
    finally {
        clearInterval(tid);
    }
    (0, utils_1.printProposalCreationState)(status);
}
exports.batchCreateProposals = batchCreateProposals;
async function createTx(ctx, proposerPubkey, proposal, txAccount, txAccountInfo, dryRun) {
    const accountNotExist = !txAccountInfo || txAccountInfo.lamports == 0;
    const accountEmpty = accountNotExist || txAccountInfo.data.toString("hex").replaceAll("0", "").length === 0;
    if (!accountEmpty) {
        return `${chalk_1.default.green(`already created: `)} ${chalk_1.default.grey(" => ")} ${proposal
            .calcTransactionAccount()
            .publicKey.toBase58()}`;
    }
    const instrs = await proposal.createInstr(ctx);
    const ix = instrs.multisigInstr;
    const instructions = instrs.prepare?.instructions ?? [];
    const signers = instrs.prepare?.signers ?? [];
    if (dryRun) {
        console.log("multisig instr:");
        console.log("programId:", ix.programId.toBase58());
        console.log("data:", ix.data.toString("hex"));
        console.log("accounts:");
        (0, utils_1.printKeys)(ix.keys);
        return "created";
    }
    if (accountNotExist) {
        const txSize = 100 + 34 * ix.keys.length + ix.data.length;
        instructions.push(await ctx.multisigProg.account.transaction.createInstruction(txAccount, txSize));
        signers.push(txAccount);
    }
    if (accountEmpty) {
        instructions.push(await ctx.multisigProg.instruction.createTransaction(ix.programId, ix.keys, ix.data, {
            accounts: {
                multisig: ctx.multisig,
                transaction: txAccount.publicKey,
                proposer: proposerPubkey,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            },
        }));
    }
    const txEnvelope = new core_sdk_1.RetriableTransactionEnvelope(ctx.provider, instructions, signers);
    const receipts = await txEnvelope.confirmAll({ resend: 100, commitment: "finalized" });
    return receipts.map((receipt) => receipt.signature).toString();
}
//# sourceMappingURL=batchCreate.js.map