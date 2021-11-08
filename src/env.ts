import { PublicKey } from "@solana/web3.js";
import { homedir } from "os";
import { join } from "path";

export var ENV = {
  multisigProgram: new PublicKey(
    process.env.MULTISIG_PROGRAM ||
      "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"
  ), //default devnet program
  wallet: process.env.WALLET || join(homedir(), ".config/solana/id.json"), //some key path like id.json
  rpcUrl: process.env.RPC_URL || "https://api.devnet.solana.com",
};
