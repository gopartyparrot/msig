import { PublicKey } from "@solana/web3.js"
import { IProposals } from "../types"
import { getMultisigContext, getProgramFromEnv } from "../utils"
import { batchApproveExecuteProposals } from "./batchApproveExecute"
import { batchCreateProposals } from "./batchCreate"
import { batchVerifyProposals } from "./batchVerify"

interface IOptions {
  multisigProgram?: string
  dryRun?: boolean
  verbose?: boolean
  skipExecute?: boolean
}

export async function runProposal(
  proposal: IProposals,
  action: "create" | "approve" | "verify",
  opts: IOptions = {},
) {
  const env = {
    multisigProgram: new PublicKey(opts.multisigProgram ?? process.env.MULTISIG_PROGRAM),
  }

  const ctx = await getMultisigContext(getProgramFromEnv(env), proposal.multisig)

  switch (action) {
    case "verify":
      await batchVerifyProposals(ctx, proposal.transactions, opts.verbose)
      break
    case "create":
      await batchCreateProposals(ctx, proposal.transactions, opts.dryRun)
      break
    case "approve":
      await batchApproveExecuteProposals(ctx, proposal.transactions, opts.skipExecute, opts.verbose)
      break
    default:
      break
  }
}
