import {
  Keypair,
  PublicKey,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { fromByteArray } from "base64-js";

import {
  MultisigContext,
  MultisigTransactionStruct,
  NamedPubkey,
} from "../types";
import { printKeys } from "../utils";

export abstract class ProposalBase {
  constructor(
    public memo: string,
    public accounts: NamedPubkey | PublicKey[], //used to create instruction
  ) {}

  public calcAccountWithSeed(seed: string): Keypair {
    return Keypair.fromSeed(
      nacl.hash(Uint8Array.from(Buffer.from(seed))).slice(0, 32),
    );
  }

  public calcTransactionAccount(): Keypair {
    const seed = nacl.hash(Uint8Array.from(Buffer.from(this.memo)));
    return Keypair.fromSeed(seed.slice(0, 32));
  }

  // throw error if verify failed
  public async verifyTx(
    ctx: MultisigContext,
    chainTxState: MultisigTransactionStruct,
    verbose: boolean,
  ) {
    const instrs = await this.createInstr(ctx);
    const multisigInstr = instrs.multisigInstr;

    if (multisigInstr.keys.length != chainTxState.accounts.length) {
      throw Error(
        `verify failed, accounts length not match, local: ${multisigInstr.keys.length}, chain: ${chainTxState.accounts.length}`,
      );
    }
    for (let i = 0; i < multisigInstr.keys.length; i++) {
      if (
        multisigInstr.keys[i].pubkey.toBase58() != chainTxState.accounts[i].pubkey.toBase58()
      ) {
        throw Error(`verify failed, accounts (index: ${i}) not match`);
      }
    }

    if (
      !multisigInstr.data.equals(chainTxState.data) ||
      multisigInstr.programId.toBase58() != chainTxState.programId.toBase58()
    ) {
      throw Error("verify failed, programId or instruction data not match");
    }

    if (verbose) {
      console.log("multisig instruction:");
      console.log("program id:", multisigInstr.programId.toBase58());
      console.log("accounts:");
      printKeys(multisigInstr.keys);
      console.log(
        "local created instr in base64: ",
        fromByteArray(multisigInstr.data),
      );
    }
  }

  // use deterministic address (calculated from memo string)
  abstract createInstr(
    ctx: MultisigContext,
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
