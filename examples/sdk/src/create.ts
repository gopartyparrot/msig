import { Keypair, PublicKey } from "@solana/web3.js";
import {
  buildMultisigProgram,
  batchCreate,
  getEnvPublicKeys,
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
    program,
    await getEnvPublicKeys(accounts.multisig),
    PROPOSALS
  );
}

setupJSONPrint();
createProposals();
