"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalBase = void 0;
const web3_js_1 = require("@solana/web3.js");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const base64_js_1 = require("base64-js");
const utils_1 = require("../utils");
const __1 = require("..");
class ProposalBase {
    memo;
    accounts;
    info;
    constructor(memo, accounts, //used to create instruction
    info) {
        this.memo = memo;
        this.accounts = accounts;
        this.info = info;
    }
    calcAccountWithSeed(seed) {
        return web3_js_1.Keypair.fromSeed(tweetnacl_1.default.hash(Uint8Array.from(Buffer.from(seed))).slice(0, 32));
    }
    calcTransactionAccount() {
        const seed = tweetnacl_1.default.hash(Uint8Array.from(Buffer.from(this.memo)));
        return web3_js_1.Keypair.fromSeed(seed.slice(0, 32));
    }
    // throw error if verify failed
    async verifyTx(ctx, chainTxState, verbose) {
        const instrs = await this.createInstr(ctx);
        const multisigInstr = instrs.multisigInstr;
        if (multisigInstr.keys.length != chainTxState.accounts.length) {
            throw Error(`verify failed, accounts length not match, local: ${multisigInstr.keys.length}, chain: ${chainTxState.accounts.length}`);
        }
        for (let i = 0; i < multisigInstr.keys.length; i++) {
            if (multisigInstr.keys[i].pubkey.toBase58() != chainTxState.accounts[i].pubkey.toBase58()) {
                throw Error(`verify failed, accounts (index: ${i}) not match`);
            }
        }
        if (!multisigInstr.data.equals(chainTxState.data)) {
            console.log(multisigInstr.data.toString("hex"));
            console.log(chainTxState.data.toString("hex"));
            throw Error("verify failed, instruction data not match");
        }
        if (multisigInstr.programId.toBase58() != chainTxState.programId.toBase58()) {
            throw Error(`verify failed, programId not match, local: ${multisigInstr.programId.toBase58()}, created: ${chainTxState.programId.toBase58()}`);
        }
        if (verbose) {
            console.log("multisig instruction:");
            console.log("program id:", multisigInstr.programId.toBase58());
            console.log("info:");
            (0, __1.printNestedObjectWithPublicKey)(this.info);
            console.log("accounts:");
            (0, utils_1.printKeys)(multisigInstr.keys);
            console.log("local created instr in base64: ", (0, base64_js_1.fromByteArray)(multisigInstr.data));
        }
    }
}
exports.ProposalBase = ProposalBase;
//# sourceMappingURL=ProposalBase.js.map