#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const packageJSON = __importStar(require("../../package.json"));
const commander_1 = require("commander");
const utils_1 = require("../utils");
const batchCreate_1 = require("../commands/batchCreate");
const batchVerify_1 = require("../commands/batchVerify");
const batchApproveExecute_1 = require("../commands/batchApproveExecute");
const setupMultisig_1 = require("../commands/setupMultisig");
const path_1 = require("path");
const inspectMultisig_1 = require("../commands/inspectMultisig");
const web3_js_1 = require("@solana/web3.js");
const os_1 = require("os");
const fs_1 = require("fs");
(0, utils_1.setupJSONPrint)(web3_js_1.PublicKey);
(0, utils_1.setupJSONPrint)(anchor_1.web3.PublicKey);
async function loadProposals(fname) {
    const fpath = (0, path_1.join)(process.cwd(), ENV.proposalDir, fname);
    const mod = require(fpath).default;
    if (typeof mod == "function") {
        // () => Promise<IProposals>
        let proposals = await mod();
        return proposals;
    }
    return mod;
}
// require("dotenv").config();
let ENV = {
    multisigProgram: new web3_js_1.PublicKey(process.env.MULTISIG_PROGRAM || "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"),
    wallet: process.env.WALLET || (0, path_1.join)((0, os_1.homedir)(), ".config/solana/id.json"),
    // https://api.testnet.solana.com
    rpcUrl: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
    proposalDir: process.env.PROPOSAL_DIR || "",
};
function printEnv() {
    const wallet = (0, utils_1.getWalletFromFile)(ENV.wallet);
    console.log("env:", ENV);
    console.log("wallet:", wallet.publicKey.toBase58());
}
let cli = new commander_1.Command();
cli.version(packageJSON.version);
cli
    .option("--rpc <rpc>", "RPC URL", "https://api.mainnet-beta.solana.com")
    .option("--program <program>", "multisig program", "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt")
    .option("--wallet <wallet>", "wallet file", "./id.json")
    .on("option:rpc", () => (ENV.rpcUrl = cli.opts().rpc))
    .on("option:program", () => (ENV.multisigProgram = new web3_js_1.PublicKey(cli.opts().program)))
    .on("option:wallet", () => (ENV.wallet = cli.opts().wallet));
cli.command("genkey [keyfile]").action((keyfile) => {
    const acc = new web3_js_1.Account();
    console.log("Public key:");
    console.log(acc.publicKey.toBase58());
    console.log("Private key (hex):");
    console.log(acc.secretKey.toString("hex"));
    console.log("Private key (json):");
    console.log(acc.secretKey.toJSON().data);
    if (keyfile) {
        (0, fs_1.writeFileSync)(keyfile, JSON.stringify(acc.secretKey.toJSON().data));
    }
});
cli.command("env").action(() => {
    printEnv();
});
cli
    .command("setup")
    .description("create new multisig")
    .requiredOption("--owners <owners...>", "members of multisig")
    .requiredOption("--threshold <threshold>", "min signatures needed", "1")
    .action(async ({ owners, threshold }) => {
    if (owners.length < 2 || owners.length < parseInt(threshold)) {
        throw Error("at least 2 members and threshold >= owners.length");
    }
    (0, setupMultisig_1.setupMultisig)((0, utils_1.getProgramFromEnv)(ENV), parseInt(threshold), owners);
});
cli
    .command("create")
    .description("create multisig transactions from proposals")
    .argument("[proposals]", "proposal js file", "proposals.js")
    .option("--small-tx", "will send create multisig instruction separately apart from prepare instruction (to avoid error: Transaction too large)", false)
    .option("--dry-run", "will not send transaction, just print instructions", false)
    .action(async (proposals, opts) => {
    const rProposals = await loadProposals(proposals);
    await (0, batchCreate_1.batchCreateProposals)(await (0, utils_1.getMultisigContext)((0, utils_1.getProgramFromEnv)(ENV), rProposals.multisig), rProposals.transactions, opts.dryRun);
});
cli
    .command("verify")
    .description("verify created multisig transactions from proposals")
    .argument("[proposals]", "proposal js file", "proposals.js")
    .option("-m, --more", "verbose print", false)
    .action(async (proposals, args) => {
    const rProposals = await loadProposals(proposals);
    await (0, batchVerify_1.batchVerifyProposals)(await (0, utils_1.getMultisigContext)((0, utils_1.getProgramFromEnv)(ENV), rProposals.multisig), rProposals.transactions, args.more);
});
cli
    .command("approve")
    .description("approve and execute created multisig transactions from proposals")
    .argument("[proposals]", "proposal js file", "proposals.js")
    .option("--skip-exec", "don't execute multisig transaction(but will approve)", false)
    .option("-m, --more", "verbose print", false)
    .action(async (proposals, args) => {
    const rProposals = await loadProposals(proposals);
    printEnv();
    await (0, batchApproveExecute_1.batchApproveExecuteProposals)(await (0, utils_1.getMultisigContext)((0, utils_1.getProgramFromEnv)(ENV), rProposals.multisig), rProposals.transactions, args.skipExec, args.more);
});
cli
    .command("info")
    .argument("<multisig>", "multisig address")
    .description("print multisig info")
    .action(async (multisig) => {
    await (0, inspectMultisig_1.inspectMultisig)((0, utils_1.getProgramFromEnv)(ENV), new web3_js_1.PublicKey(multisig));
});
cli.parse(process.argv);
//# sourceMappingURL=cli.js.map