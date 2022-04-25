"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMultisig = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const assert_1 = __importDefault(require("assert"));
async function setupMultisig(multisigProgram, threshold, members, multisig) {
    const owners = members.map((m) => new web3_js_1.PublicKey(m));
    (0, assert_1.default)(owners.length >= threshold, "threshold must gt owners.length");
    const multisigSize = 8 + 4 + owners.length * 32 + 16;
    if (!multisig) {
        multisig = web3_js_1.Keypair.generate();
    }
    const currentMultisigBalance = await multisigProgram.provider.connection.getBalance(multisig.publicKey);
    if (currentMultisigBalance > 0) {
        console.log("multisig account already exists");
        return;
    }
    const [multisigSigner, nonce] = await web3_js_1.PublicKey.findProgramAddress([multisig.publicKey.toBuffer()], multisigProgram.programId);
    const txid = await multisigProgram.rpc.createMultisig(owners, new anchor_1.BN(threshold), nonce, {
        accounts: {
            multisig: multisig.publicKey,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        },
        instructions: [
            await multisigProgram.account.multisig.createInstruction(multisig, multisigSize),
        ],
        signers: [multisig],
    });
    console.log("txid:", txid);
    console.log("msig wallet address (don't send tokens to this address):");
    console.log(multisig.publicKey.toBase58());
    console.log("msig wallet PDA (send tokens here):");
    console.log(multisigSigner.toBase58());
}
exports.setupMultisig = setupMultisig;
//# sourceMappingURL=setupMultisig.js.map