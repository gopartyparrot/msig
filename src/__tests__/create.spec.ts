import {
  findMultisigSigner,
  getProgramFromEnv,
  setupJSONPrint,
} from "../common/utils";
import { setProposals } from "../proposals";
import { TEST_KEYS } from "./keys";
import { testProposals } from "./proposals";
import { batchCreate } from "../commands/batchCreate";
import { ENV } from "../env";

describe("create proposals", () => {
  it("should create success", async () => {
    setupJSONPrint();
    setProposals(testProposals); //replace default global proposals with test proposals

    const program = getProgramFromEnv(TEST_KEYS.memberA);

    const multisigSigner = await findMultisigSigner(
      program.programId,
      TEST_KEYS.multisig.publicKey
    );

    await batchCreate(program, {
      multisigProgram: ENV.multisigProgram,
      multisig: TEST_KEYS.multisig.publicKey,
      multisigSigner,
    });
  });
});
