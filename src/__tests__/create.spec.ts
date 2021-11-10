import { findMultisigSigner, setupJSONPrint } from "../utils";
import { batchCreateProposals } from "../commands/batchCreate";
import {
  getDevnetProgramFromEnvWithWallet,
  testProposals,
  TEST_KEYS,
} from "./common";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();

    const program = getDevnetProgramFromEnvWithWallet(TEST_KEYS.memberA);

    const multisigPDA = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey,
    );

    await batchCreateProposals(
      {
        multisigProg: program,
        multisig: TEST_KEYS.multisig.publicKey,
        multisigPDA,
      },
      testProposals,
    );
  });
});
