import { findMultisigSigner, setupJSONPrint } from "../utils";
import { ensureDevnetEnv, getProgramFromEnvWithWallet } from "./common";
import { batchApproveExecuteProposals } from "../commands/batchApproveExecute";
import { testProposals, TEST_KEYS } from "./common";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();

    const program = getProgramFromEnvWithWallet(TEST_KEYS.memberB);
    await ensureDevnetEnv(program, TEST_KEYS.memberB); //ensure SOL

    const multisigSigner = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey
    );

    await batchApproveExecuteProposals(
      program,
      {
        multisig: TEST_KEYS.multisig.publicKey,
        multisigSigner,
      },
      testProposals,
      true
    );
  });
});
