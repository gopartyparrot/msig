#!/usr/bin/env node

import { web3 } from "@project-serum/anchor"
import * as packageJSON from "../../package.json"
import { Command } from "commander"
import { getMultisigContext, getProgramFromEnv, getWalletFromFile, setupJSONPrint } from "../utils"
import { batchCreateProposals } from "../commands/batchCreate"
import { batchVerifyProposals } from "../commands/batchVerify"
import { batchApproveExecuteProposals } from "../commands/batchApproveExecute"
import { setupMultisig } from "../commands/setupMultisig"
import { join } from "path"
import { IProposals } from "../types"
import { inspectMultisig } from "../commands/inspectMultisig"
import { Account, PublicKey } from "@solana/web3.js"
import { homedir } from "os"
import { writeFileSync } from "fs"

setupJSONPrint(PublicKey)
setupJSONPrint(web3.PublicKey)

async function loadProposals(fname: string): Promise<IProposals> {
  const fpath = join(process.cwd(), ENV.proposalDir, fname)
  const mod = require(fpath).default

  if (typeof mod == "function") {
    // () => Promise<IProposals>
    let proposals: IProposals = await mod()
    return proposals
  }

  return mod
}

// require("dotenv").config();

let ENV = {
  multisigProgram: new PublicKey(
    process.env.MULTISIG_PROGRAM || "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt",
  ),
  wallet: process.env.WALLET || join(homedir(), ".config/solana/id.json"),
  // https://api.testnet.solana.com
  rpcUrl: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",

  proposalDir: process.env.PROPOSAL_DIR || "",
}

function printEnv() {
  const wallet = getWalletFromFile(ENV.wallet)
  console.log("env:", ENV)
  console.log("wallet:", wallet.publicKey.toBase58())
}

let cli = new Command()

cli.version(packageJSON.version)

cli
  .option("--rpc <rpc>", "RPC URL", "https://api.mainnet-beta.solana.com")
  .option("--program <program>", "multisig program", "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt")
  .option("--wallet <wallet>", "wallet file", "./id.json")
  .on("option:rpc", () => (ENV.rpcUrl = cli.opts().rpc))
  .on("option:program", () => (ENV.multisigProgram = new PublicKey(cli.opts().program)))
  .on("option:wallet", () => (ENV.wallet = cli.opts().wallet))

cli.command("genkey [keyfile]").action((keyfile) => {
  const acc = new Account()
  console.log("Public key:")
  console.log(acc.publicKey.toBase58())
  console.log("Private key (hex):")
  console.log(acc.secretKey.toString("hex"))
  console.log("Private key (json):")
  console.log(acc.secretKey.toJSON().data)

  if (keyfile) {
    writeFileSync(keyfile, JSON.stringify(acc.secretKey.toJSON().data))
  }
})

cli.command("env").action(() => {
  printEnv()
})

cli
  .command("setup")
  .description("create new multisig")
  .requiredOption("--owners <owners...>", "members of multisig")
  .requiredOption("--threshold <threshold>", "min signatures needed", "1")
  .action(async ({ owners, threshold }: { owners: string[]; threshold: string }) => {
    if (owners.length < 2 || owners.length < parseInt(threshold)) {
      throw Error("at least 2 members and threshold >= owners.length")
    }
    setupMultisig(getProgramFromEnv(ENV), parseInt(threshold), owners)
  })

cli
  .command("create")
  .description("create multisig transactions from proposals")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .option(
    "--small-tx",
    "will send create multisig instruction separately apart from prepare instruction (to avoid error: Transaction too large)",
    false,
  )
  .option("--dry-run", "will not send transaction, just print instructions", false)
  .action(
    async (
      proposals: string,
      opts: {
        smallTx: boolean
        dryRun: boolean
      },
    ) => {
      const rProposals: IProposals = await loadProposals(proposals)
      await batchCreateProposals(
        await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
        rProposals.transactions,
        opts.smallTx,
        opts.dryRun,
      )
    },
  )

cli
  .command("verify")
  .description("verify created multisig transactions from proposals")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .option("-m, --more", "verbose print", false)
  .action(async (proposals: string, args: any) => {
    const rProposals: IProposals = await loadProposals(proposals)

    await batchVerifyProposals(
      await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
      rProposals.transactions,
      args.more,
    )
  })

cli
  .command("approve")
  .description("approve and execute created multisig transactions from proposals")
  .argument("[proposals]", "proposal js file", "proposals.js")
  .option("--skip-exec", "don't execute multisig transaction(but will approve)", false)
  .option("-m, --more", "verbose print", false)
  .action(
    async (
      proposals: string,
      args: {
        more: boolean
        skipExec: boolean
      },
    ) => {
      const rProposals: IProposals = await loadProposals(proposals)
      printEnv()
      await batchApproveExecuteProposals(
        await getMultisigContext(getProgramFromEnv(ENV), rProposals.multisig),
        rProposals.transactions,
        args.skipExec,
        args.more,
      )
    },
  )

cli
  .command("info")
  .argument("<multisig>", "multisig address")
  .description("print multisig info")
  .action(async (multisig: string) => {
    await inspectMultisig(getProgramFromEnv(ENV), new PublicKey(multisig))
  })

cli.parse(process.argv)
