import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "./types";

export class TransferTokenToOwner extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      source: PublicKey;
      toOwner: PublicKey;
    },
    public amount: u64
  ) {
    super(memo, accounts);
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    const mint = await this.getTokenAccountMint(
      ctx.multisigProg.provider.connection,
      this.accounts.source
    );

    const toAssociatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      this.accounts.toOwner,
      true
    );
    const ret: TransactionInstructionExt = {
      multisigInstr: Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        this.accounts.source,
        toAssociatedTokenAddress,
        ctx.multisigPDA,
        [],
        this.amount
      ),
    };
    const solBalance = await ctx.multisigProg.provider.connection.getBalance(
      toAssociatedTokenAddress
    );
    if (solBalance === 0) {
      ret.prepare = {
        instructions: [
          await Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            toAssociatedTokenAddress,
            this.accounts.toOwner,
            ctx.multisigProg.provider.wallet.publicKey
          ),
        ],
      };
    }
    return ret;
  }

  async getTokenAccountMint(
    conn: Connection,
    tokenAcc: PublicKey
  ): Promise<PublicKey> {
    const info = await conn.getAccountInfo(tokenAcc, "confirmed");
    if (!info) {
      throw Error("token account not found for:" + tokenAcc.toBase58());
    }
    const accountInfo = AccountLayout.decode(Buffer.from(info.data));
    return new PublicKey(accountInfo.mint);
  }
}
