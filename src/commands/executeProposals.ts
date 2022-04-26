import { PublicKey } from "@solana/web3.js"
import { IEnv, IProposals } from "../types"
import { getMultisigContext, getProgramFromEnv } from "../utils"
import { batchCreateProposals } from "./batchCreate"

export async function executeProposals(
  proposal: IProposals,
  opts: Partial<IEnv & { dryRun: boolean }> = {},
) {
  const env = {
    multisigProgram: new PublicKey(
      process.env.MULTISIG_PROGRAM || "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt",
    ),
    ...opts,
  }

  await batchCreateProposals(
    await getMultisigContext(getProgramFromEnv(env), proposal.multisig),
    proposal.transactions,
    opts.dryRun,
  )
}
