#!/usr/bin/env node

import * as packageJSON from "../../package.json";
import { Command } from "commander";
import {
  getMultisigContext,
  getProgramFromEnv,
  setupJSONPrint,
} from "../utils";
import { batchCreate } from "../commands/batchCreate";
import { batchVerify } from "../commands/batchVerify";
import { batchApproveExecuteProposals } from "../commands/batchApproveExecute";
import { createMultisig } from "../commands/setupMultisig";
import { join } from "path";
import { IProposals } from "../types";
import { inspectMultisig } from "../commands/inspectMultisig";
import { PublicKey } from "@solana/web3.js";
import { homedir } from "os";

setupJSONPrint();

let ENV = {
  multisigProgram: new PublicKey(
    process.env.MULTISIG_PROGRAM ||
      "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"
  ),
  wallet: process.env.WALLET || join(homedir(), ".config/solana/id.json"),
  rpcUrl: process.env.RPC_URL || "https://api.devnet.solana.com",
};

let cli = new Command();

cli.version(packageJSON.version);

cli
  .option("--rpc <rpc>", "rpc url", "https://api.devnet.solana.com")
  .option(
    "--program <program>",
    "multisig program",
    "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"
  )
  .option("--wallet <wallet>", "wallet file", "./id.json")
  .on("option:rpc", () => (ENV.rpcUrl = cli.opts().rpc))
  .on("option:program", () => (ENV.multisigProgram = cli.opts().program))
  .on("option:wallet", () => (ENV.wallet = cli.opts().wallet));

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
    }
  );

cli
  .command("create")
  .description("create multisig transactions from proposals")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .action(async (proposals: string, opts: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchCreate(
      await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
      rProposals.transactions
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
      args.more
    );
  });

cli
  .command("approve")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .description(
    "approve and execute created multisig transactions from proposals"
  )
  .option("-m, --more", "verbose print", false)
  .action(async (proposals: string, args: any) => {
    const rProposals: IProposals = require(join(process.cwd(), proposals));
    await batchApproveExecuteProposals(
      await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
      rProposals.transactions,
      args.more
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
