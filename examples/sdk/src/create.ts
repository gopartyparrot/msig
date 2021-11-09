import { Keypair, PublicKey } from "@solana/web3.js";
import {
  buildMultisigProgram,
  batchCreate,
  getMultisigContext,
} from "@parrotfi/msig";
import { readFileSync } from "fs";
import { join } from "path";
import { accounts } from "./accounts";
import { PROPOSALS, setupJSONPrint } from "./proposals";

async function createProposals() {
  const wallet = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        readFileSync(join(__dirname, "../../a.json"), {
          encoding: "utf-8",
        })
      )
    )
  );

  const program = buildMultisigProgram(
    "https://api.devnet.solana.com",
    new PublicKey("msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"),
    wallet
  );

  await batchCreate(
    await getMultisigContext(program, accounts.multisig),
    PROPOSALS
  );
}

setupJSONPrint();
createProposals();
