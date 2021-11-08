import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "../types";

// mint(0) -> dest(1) -> owner authority(2, multisig PDA)
export class TokenMintToOwner extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      mint: PublicKey;
      owner: PublicKey;
    },
    public amount: u64
  ) {
    super(memo, accounts);
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.accounts.mint,
      this.accounts.owner,
      true
    );

    const ret: TransactionInstructionExt = {
      multisigInstr: Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        this.accounts.mint,
        associatedTokenAddress,
        ctx.multisigPDA,
        [],
        this.amount
      ),
    };

    const solBalance = await ctx.multisigProg.provider.connection.getBalance(
      associatedTokenAddress
    );

    if (solBalance === 0) {
      ret.prepare = {
        instructions: [
          await Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            this.accounts.mint,
            associatedTokenAddress,
            this.accounts.owner,
            ctx.multisigProg.provider.wallet.publicKey
          ),
        ],
      };
    }
    return ret;
  }
}
