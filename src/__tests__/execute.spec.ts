import {
  findMultisigSigner,
  getProgramFromEnv,
  setupJSONPrint,
} from "../common/utils";
import { setProposals } from "../proposals";
import { prepareDevnetEnv } from "./common";
import { testProposals } from "./proposals";
import { batchApproveExecute } from "../commands/batchApproveExecute";
import { ENV } from "../env";
import { TEST_KEYS } from "./keys";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();
    setProposals(testProposals); //replace default global proposals with test proposals

    const program = getProgramFromEnv(TEST_KEYS.memberB);
    await prepareDevnetEnv(program, TEST_KEYS.memberB); //ensure SOL

    const multisigSigner = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey
    );

    await batchApproveExecute(
      program,
      {
        multisigProgram: ENV.multisigProgram,
        multisig: TEST_KEYS.multisig.publicKey,
        multisigSigner,
      },
      true
    );
  });
});
