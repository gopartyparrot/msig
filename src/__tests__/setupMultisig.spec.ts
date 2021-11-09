import {
  ensureDevnetEnv,
  getDevnetProgramFromEnvWithWallet,
  TEST_KEYS,
} from "./common";

import { createMultisig } from "../commands/setupMultisig";

describe("create multisig", () => {
  it("should create success", async () => {
    const program = getDevnetProgramFromEnvWithWallet(TEST_KEYS.memberA);
    await ensureDevnetEnv(program, TEST_KEYS.memberA);

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
