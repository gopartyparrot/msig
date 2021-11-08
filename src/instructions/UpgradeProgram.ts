import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "../types";

const BPF_LOADER_UPGRADEABLE_PID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111"
);

//untested
export class UpgradeProgram extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      program: PublicKey;
      buffer: PublicKey;
    }
  ) {
    super(memo, accounts);
  }

  async createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt> {
    console.log(`
-------------NOTICE: upgrade program start-----------------
it's your work to verify buffer content!
-------------NOTICE: upgrade program end-----------------
`);

    const programAccount =
      await ctx.multisigProg.provider.connection.getAccountInfo(
        this.accounts.program
      );
    if (programAccount === null) {
      throw new Error("Invalid program ID");
    }
    const programdataAddress = new PublicKey(programAccount.data.slice(4));

    const keys = [
      {
        pubkey: programdataAddress,
        isWritable: true,
        isSigner: false,
      },
      { pubkey: this.accounts.program, isWritable: true, isSigner: false },
      { pubkey: this.accounts.buffer, isWritable: true, isSigner: false },
      {
        pubkey: ctx.multisigProg.provider.wallet.publicKey,
        isWritable: true,
        isSigner: false,
      }, //spill to receive buffer account SOL
      { pubkey: SYSVAR_RENT_PUBKEY, isWritable: false, isSigner: false },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isWritable: false, isSigner: false },
      { pubkey: ctx.multisigPDA, isWritable: false, isSigner: false },
    ];
    const data = Buffer.from([3, 0, 0, 0]);
    return {
      multisigInstr: new TransactionInstruction({
        programId: BPF_LOADER_UPGRADEABLE_PID,
        keys,
        data,
      }),
    };
  }
}
