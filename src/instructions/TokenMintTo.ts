import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"

import { ProposalBase, TransactionInstructionExt } from "./ProposalBase"
import { MultisigContext } from "../types"

// mint(0) -> dest(1) -> owner authority(2, multisig PDA)
export class TokenMintTo extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      mint: PublicKey
      destination: PublicKey
    },
    public amount: u64,
  ) {
    super(memo, accounts)
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    return {
      multisigInstr: Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        this.accounts.mint,
        this.accounts.destination,
        ctx.multisigPDA,
        [],
        this.amount,
      ),
    }
  }
}
