import * as packageJSON from "../package.json";
import { Command } from "commander";
import {
  getEnvPublicKeys,
  getProgramWithEnvWallet,
  setupJSONPrint,
} from "./common/utils";
import { batchCreate } from "./commands/batchCreate";
import { batchVerify } from "./commands/batchVerify";
import { batchApproveExecute } from "./commands/batchApproveExecute";
import { ENV } from "./env";
import { createMultisig } from "./commands/createMultisig";

setupJSONPrint();
let cli = new Command();

cli.version(packageJSON.version);

cli
  .command("new")
  .description("create new multisig")
  .requiredOption("--owners <owners>", "split with ,")
  .requiredOption("--threshold <threshold>", "signatures needed", "1")
  .action(async (args: { owners: string; threshold: string }) => {
    const arr = args.owners.split(",");
    if (arr.length < 2) {
      throw Error("at least 2 members");
    }
    createMultisig(getProgramWithEnvWallet(), parseInt(args.threshold), arr);
  });

cli
  .command("create")
  .description("create multisig transactions from proposals")
  .action(async (args: any) => {
    batchCreate(getProgramWithEnvWallet(), await getEnvPublicKeys());
  });

cli
  .command("verify")
  .description("verify created multisig transactions from proposals")
  .option("-m, --more", "verbose print", false)
  .action(async (args: any) => {
    batchVerify(getProgramWithEnvWallet(), await getEnvPublicKeys(), args.more);
  });

cli
  .command("execute")
  .description(
    "approve and execute created multisig transactions from proposals"
  )
  .option("-m, --more", "verbose print", false)
  .action(async (args: any) => {
    batchApproveExecute(
      getProgramWithEnvWallet(),
      await getEnvPublicKeys(),
      args.more
    );
  });

console.log("env:", ENV);
cli.parse(process.argv);

//TODO: inspect multisig
