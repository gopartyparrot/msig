import { Keypair, PublicKey } from "@solana/web3.js"
import {
  buildMultisigProgram,
  batchApproveExecuteProposals,
  getMultisigContext,
} from "@parrotfi/msig"
import { readFileSync } from "fs"
import { join } from "path"
import { accounts } from "./accounts"
import { PROPOSALS, setupJSONPrint } from "./proposals"

async function approveProposals() {
  const wallet = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        readFileSync(join(__dirname, "../../b.json"), {
          encoding: "utf-8",
        }),
      ),
    ),
  )

  const program = buildMultisigProgram(
    "https://api.devnet.solana.com",
    new PublicKey("msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"),
    wallet,
  )

  await batchApproveExecuteProposals(
    await getMultisigContext(program, accounts.multisig),
    PROPOSALS,
    false,
    true,
  )
}

setupJSONPrint()
approveProposals()
