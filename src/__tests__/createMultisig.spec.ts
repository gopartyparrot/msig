import { getProgramFromEnv } from "../common/utils";
import { prepareDevnetEnv } from "./common";
import { createMultisig } from "../commands/createMultisig";
import { TEST_KEYS } from "./keys";

describe("create multisig", () => {
  it("should create success", async () => {
    const program = getProgramFromEnv(TEST_KEYS.memberA);
    await prepareDevnetEnv(program, TEST_KEYS.memberA);

    await createMultisig(
      program,
      2,
      [
        TEST_KEYS.memberA.publicKey.toBase58(),
        TEST_KEYS.memberB.publicKey.toBase58(),
      ],
      TEST_KEYS.multisig
    );
  });
});
