#!/usr/bin/env node

import * as packageJSON from "../../package.json";
import { Command } from "commander";
import {
  getMultisigContext,
  getProgramFromEnv,
  getWalletFromFile,
  setupJSONPrint,
} from "../utils";
import { batchCreate } from "../commands/batchCreate";
import { batchVerify } from "../commands/batchVerify";
import { batchApproveExecuteProposals } from "../commands/batchApproveExecute";
import { createMultisig } from "../commands/setupMultisig";
import { join } from "path";
import { IProposals } from "../types";
import { inspectMultisig } from "../commands/inspectMultisig";
import { Account, PublicKey } from "@solana/web3.js";
import { homedir } from "os";
import { writeFileSync } from "fs";

setupJSONPrint();

// require("dotenv").config();

let ENV = {
  multisigProgram: new PublicKey(
    process.env.MULTISIG_PROGRAM ||
      "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt",
  ),
  wallet: process.env.WALLET || join(homedir(), ".config/solana/id.json"),
  // https://api.testnet.solana.com
  rpcUrl: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
};

function printEnv() {
  const wallet = getWalletFromFile(ENV.wallet);
  console.log("env:", ENV);
  console.log("wallet:", wallet.publicKey.toBase58());
}

let cli = new Command();

cli.version(packageJSON.version);

cli
  .option("--rpc <rpc>", "RPC URL", "https://api.mainnet-beta.solana.com")
  .option(
    "--program <program>",
    "multisig program",
    "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt",
  )
  .option("--wallet <wallet>", "wallet file", "./id.json")
  .on("option:rpc", () => (ENV.rpcUrl = cli.opts().rpc))
  .on("option:program", () => (ENV.multisigProgram = cli.opts().program))
  .on("option:wallet", () => (ENV.wallet = cli.opts().wallet));

cli.command("genkey [keyfile]").action((keyfile) => {
  const acc = new Account();
  console.log("Public key:");
  console.log(acc.publicKey.toBase58());
  console.log("Private key (hex):");
  console.log(acc.secretKey.toString("hex"));
  console.log("Private key (json):");
  console.log(acc.secretKey.toJSON().data);

  if (keyfile) {
    writeFileSync(keyfile, JSON.stringify(acc.secretKey.toJSON().data));
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
  .action(
    async ({ owners, threshold }: { owners: string[]; threshold: string }) => {
      if (owners.length < 2 || owners.length < parseInt(threshold)) {
        throw Error("at least 2 members and threshold >= owners.length");
      }
      createMultisig(getProgramFromEnv(ENV), parseInt(threshold), owners);
    },
  );

cli
  .command("create")
  .description("create multisig transactions from proposals")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .action(async (proposals: string, opts: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchCreate(
      await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
      rProposals.transactions,
    );
  });

cli
  .command("verify")
  .description("verify created multisig transactions from proposals")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .option("-m, --more", "verbose print", false)
  .action(async (proposals: string, args: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchVerify(
      await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
      rProposals.transactions,
      args.more,
    );
  });

cli
  .command("approve")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .description(
    "approve and execute created multisig transactions from proposals",
  )
  .option("-m, --more", "verbose print", false)
  .action(async (proposals: string, args: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    printEnv();
    await batchApproveExecuteProposals(
      await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
      rProposals.transactions,
      args.more,
    );
  });

cli
  .command("info")
  .argument("<multisig>", "multisig address")
  .description("print multisig info")
  .action(async (multisig: string) => {
    await inspectMultisig(getProgramFromEnv(ENV), new PublicKey(multisig));
  });

cli.parse(process.argv);
