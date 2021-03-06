import { getDevnetProgramFromEnvWithWallet, TEST_KEYS } from "./common"
import { inspectMultisig } from "../commands/inspectMultisig"

describe("inspect multisig", () => {
  it("print multisig info", async () => {
    const program = getDevnetProgramFromEnvWithWallet(TEST_KEYS.memberA)
    await inspectMultisig(program, TEST_KEYS.multisig.publicKey)
  })
})
