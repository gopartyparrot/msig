import { findMultisigSigner, setupJSONPrint } from "../utils";
import { ensureDevnetEnv, getProgramFromEnvWithWallet } from "./common";
import { testProposals, TEST_KEYS } from "./common";
import { batchVerify } from "../commands/batchVerify";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();

    const program = getProgramFromEnvWithWallet(TEST_KEYS.memberB);
    await ensureDevnetEnv(program, TEST_KEYS.memberB);

    const multisigSigner = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey
    );

    await batchVerify(
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
