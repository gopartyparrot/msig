import { findMultisigSigner, setupJSONPrint } from "../utils";
import { batchCreate } from "../commands/batchCreate";
import {
  getProgramFromEnvWithWallet,
  testProposals,
  TEST_KEYS,
} from "./common";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();

    const program = getProgramFromEnvWithWallet(TEST_KEYS.memberA);

    const multisigSigner = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey
    );

    await batchCreate(
      program,
      {
        multisig: TEST_KEYS.multisig.publicKey,
        multisigSigner,
      },
      testProposals
    );
  });
});
