import { findMultisigSigner, setupJSONPrint } from "../utils";
import { ensureDevnetEnv, getDevnetProgramFromEnvWithWallet } from "./common";
import { batchApproveExecuteProposals } from "../commands/batchApproveExecute";
import { testProposals, TEST_KEYS } from "./common";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();

    const program = getDevnetProgramFromEnvWithWallet(TEST_KEYS.memberB);
    await ensureDevnetEnv(program, TEST_KEYS.memberB); //ensure SOL

    const multisigPDA = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey,
    );

    await batchApproveExecuteProposals(
      {
        multisigProg: program,
        multisig: TEST_KEYS.multisig.publicKey,
        multisigPDA,
      },
      testProposals,
      false,
      true,
    );
  });
});
