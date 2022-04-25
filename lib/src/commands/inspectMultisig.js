"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectMultisig = void 0;
const __1 = require("..");
async function inspectMultisig(multisigProgram, multisig) {
    const state = (await multisigProgram.account.multisig.fetch(multisig));
    console.log("multisig:", multisig.toBase58(), `(don't send tokens to this address)`);
    console.log("threshold:", state.threshold.toString());
    console.log("ownerSetSeqno:", state.ownerSetSeqno);
    console.log("owners:", state.owners.map((k) => k.toBase58()).join(","));
    const pda = await (0, __1.findMultisigSigner)(multisigProgram.programId, multisig);
    console.log("PDA:", pda.toBase58());
    //TODO transactions
}
exports.inspectMultisig = inspectMultisig;
//# sourceMappingURL=inspectMultisig.js.map