import {
  Keypair,
  PublicKey,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import nacl from "tweetnacl";

import {
  MultisigContext,
  MultisigTransactionStruct,
  NamedPubkey,
} from "../types";

export abstract class ProposalBase {
  constructor(
    public memo: string,
    public accounts: NamedPubkey | PublicKey[] //used to create instruction
  ) {}

  public calcAccountWithSeed(seed: string): Keypair {
    return Keypair.fromSeed(
      nacl.hash(Uint8Array.from(Buffer.from(seed))).slice(0, 32)
    );
  }

  public calcTransactionAccount(): Keypair {
    const seed = nacl.hash(Uint8Array.from(Buffer.from(this.memo)));
    return Keypair.fromSeed(seed.slice(0, 32));
  }

  // throw error if verify failed
  public async verifyTx(
    ctx: MultisigContext,
    chainTxState: MultisigTransactionStruct
  ) {
    const instrs = await this.createInstr(ctx);
    const multisigInstr = instrs.multisigInstr;

    if (multisigInstr.keys.length != chainTxState.accounts.length) {
      throw Error(`verify failed, accounts length not match`);
    }
    for (let i = 0; i < multisigInstr.keys.length; i++) {
      if (
        !multisigInstr.keys[i].pubkey.equals(chainTxState.accounts[i].pubkey)
      ) {
        throw Error(`verify failed, accounts (index: ${i}) not match`);
      }
    }

    if (
      !multisigInstr.data.equals(chainTxState.data) ||
      !multisigInstr.programId.equals(chainTxState.programId)
    ) {
      throw Error("verify failed, programId or instruction data not match");
    }
  }

  // use deterministic address (calculated from memo string)
  abstract createInstr(
    ctx: MultisigContext
  ): Promise<TransactionInstructionExt>;
}

export type TransactionInstructionExt = {
  multisigInstr: TransactionInstruction;

  //instructions need to execute (no multisig needed) before create multisig transaction
  prepare?: {
    instructions: TransactionInstruction[];
    signers?: Signer[];
  };
};
