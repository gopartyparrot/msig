import { findMultisigSigner, setupJSONPrint } from "../utils";
import { ensureDevnetEnv, getDevnetProgramFromEnvWithWallet } from "./common";
import { testProposals, TEST_KEYS } from "./common";
import { batchVerifyProposals } from "../commands/batchVerify";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();

    const program = getDevnetProgramFromEnvWithWallet(TEST_KEYS.memberB);
    await ensureDevnetEnv(program, TEST_KEYS.memberB);

    const multisigPDA = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey,
    );

    await batchVerifyProposals(
      {
        multisigProg: program,
        multisig: TEST_KEYS.multisig.publicKey,
        multisigPDA,
      },
      testProposals,
      true,
    );
  });
});
