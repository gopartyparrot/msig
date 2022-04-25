"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printProposalCreationState = exports.betterPrintObjectWithPublicKey = exports.ensureProposalsMemoUnique = exports.setupJSONPrint = exports.NodeWallet = exports.assertProposerIsOwnerOfMultisig = exports.getMultisigContext = exports.findMultisigSigner = exports.getProgramFromEnv = exports.getWalletFromFile = exports.buildMultisigProgram = exports.sleep = exports.fetchProposalsChainStates = exports.printNestedObjectWithPublicKey = exports.printKeys = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const core_sdk_1 = require("@parrotfi/core-sdk");
const fs_1 = require("fs");
const util_1 = __importDefault(require("util"));
const serum_multisig_idl_json_1 = __importDefault(require("./serum_multisig_idl.json"));
function printKeys(keys) {
    const bs = (b) => (b ? "y" : "n"); //bool string
    const pk = (k) => k.toBase58().padEnd(45, " "); //pad pubkey
    for (let i = 0; i < keys.length; i++) {
        const { pubkey, isWritable, isSigner } = keys[i];
        console.log(`${i}  ${pk(pubkey)} w: ${bs(isWritable)} s: ${bs(isSigner)}`);
    }
    console.log("");
}
exports.printKeys = printKeys;
function formatNestedObjectWithPublicKey(obj, loop = 0) {
    let str = "";
    for (const [key, value] of Object.entries(obj ?? {})) {
        if (value?.constructor?.name == "PublicKey") {
            str += `\n${new Array(loop).fill("  ").join("")}${key}: ${value}`;
        }
        else {
            str += `\n${new Array(loop).fill("  ").join("")}${key}: ${formatNestedObjectWithPublicKey(value, loop + 1)}`;
        }
    }
    return str;
}
function printNestedObjectWithPublicKey(obj) {
    if (obj === undefined || obj === null) {
        return;
    }
    console.log(formatNestedObjectWithPublicKey(obj));
}
exports.printNestedObjectWithPublicKey = printNestedObjectWithPublicKey;
async function fetchProposalsChainStates(multisigProg, proposals) {
    const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey);
    const chainTransactions = (await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys)).map((acc) => {
        return !acc
            ? null
            : {
                ...acc,
                data: multisigProg.coder.accounts.decode("Transaction", acc.data),
            };
    });
    return chainTransactions;
}
exports.fetchProposalsChainStates = fetchProposalsChainStates;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function buildMultisigProgram(provider, multisigProgramId) {
    return new anchor_1.Program(serum_multisig_idl_json_1.default, multisigProgramId, provider.anchorProvider);
}
exports.buildMultisigProgram = buildMultisigProgram;
function getWalletFromFile(path) {
    return web3_js_1.Keypair.fromSecretKey(Buffer.from(JSON.parse((0, fs_1.readFileSync)(path, { encoding: "utf-8" }))));
}
exports.getWalletFromFile = getWalletFromFile;
function getProgramFromEnv(ev) {
    const provider = core_sdk_1.MultipleWalletProvider.env();
    return buildMultisigProgram(provider, ev.multisigProgram);
}
exports.getProgramFromEnv = getProgramFromEnv;
async function findMultisigSigner(multisigProgram, multisigAddress) {
    const [multisigSigner, nonce] = await web3_js_1.PublicKey.findProgramAddress([multisigAddress.toBuffer()], multisigProgram);
    return multisigSigner;
}
exports.findMultisigSigner = findMultisigSigner;
async function getMultisigContext(program, multisigAddress) {
    return {
        provider: core_sdk_1.MultipleWalletProvider.env(),
        multisigProg: program,
        multisig: multisigAddress,
        multisigPDA: await findMultisigSigner(program.programId, multisigAddress),
    };
}
exports.getMultisigContext = getMultisigContext;
function assertProposerIsOwnerOfMultisig(proposerPubkey, multisig) {
    for (const owner of multisig.owners) {
        if (owner.equals(proposerPubkey)) {
            return;
        }
    }
    throw Error(`${proposerPubkey.toBase58()} is not owner of multisig`);
}
exports.assertProposerIsOwnerOfMultisig = assertProposerIsOwnerOfMultisig;
//copied from anchor
class NodeWallet {
    payer;
    constructor(payer) {
        this.payer = payer;
    }
    async signTransaction(tx) {
        tx.partialSign(this.payer);
        return tx;
    }
    async signAllTransactions(txs) {
        return txs.map((t) => {
            t.partialSign(this.payer);
            return t;
        });
    }
    get publicKey() {
        return this.payer.publicKey;
    }
}
exports.NodeWallet = NodeWallet;
/** better json print for PublicKey */
function setupJSONPrint(publicKeyClass) {
    publicKeyClass.prototype["toJSON"] = function () {
        return this.toBase58();
    };
    publicKeyClass.prototype[util_1.default.inspect.custom] = function () {
        return this.toBase58();
    };
}
exports.setupJSONPrint = setupJSONPrint;
function ensureProposalsMemoUnique(proposals) {
    const memos = new Set();
    for (const proposal of proposals) {
        if (memos.has(proposal.memo)) {
            throw Error(`duplicated memo for multisig transactions: ${proposal.memo}`);
        }
        memos.add(proposal.memo);
    }
}
exports.ensureProposalsMemoUnique = ensureProposalsMemoUnique;
/**
 * console log publicKey like
 *  ` {
        "_bn": "83b2e6cdef2e3686db68c8b5b144e7e3bdc8b445eb19fc04aa046b794d11d0bb"
      },`
 * this function try to avoid this by convert public key to base58 string
 */
function betterPrintObjectWithPublicKey(obj) {
    console.log(JSON.stringify(betterPublicKeyJSONObject(obj), null, "  "));
}
exports.betterPrintObjectWithPublicKey = betterPrintObjectWithPublicKey;
function betterPublicKeyJSONObject(obj) {
    const newObject = new Object();
    for (const key in obj) {
        const f = obj[key];
        //for error: TypeError: Cannot read property 'toBase58' of null
        if (!f) {
            newObject[key] = obj[key];
            continue;
        }
        if (f["toBase58"]) {
            newObject[key] = f.toBase58();
            continue;
        }
        if (typeof f === "object") {
            newObject[key] = betterPublicKeyJSONObject(f);
            continue;
        }
        newObject[key] = f;
    }
    return newObject;
}
function printProposalCreationState(status) {
    console.clear();
    for (const [key, state] of status.entries()) {
        console.log(`${key} => ${state}`);
    }
}
exports.printProposalCreationState = printProposalCreationState;
//# sourceMappingURL=utils.js.map