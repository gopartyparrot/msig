import { Program } from "@project-serum/anchor";
import { AccountMeta, PublicKey } from "@solana/web3.js";

export type NamedPubkey = { [key: string]: PublicKey };

export type MultisigContext = {
  multisigProg: Program;
  multisigPDA: PublicKey;
  //any context you need ...
};

export type MultisigTransactionStruct = {
  multisig: PublicKey;
  programId: PublicKey;
  accounts: AccountMeta[];
  data: Buffer;
  signers: boolean[];
  didExecute: boolean;
  ownerSetSeqno: number;
};

export interface AccountState<T> {
  pubkey: PublicKey;
  state: T | null;
}

export type MultisigStruct = {
  owners: PublicKey[];
  threshold: number;
  ownerSetSeqno: number;
};

export interface IEnvPublicKeys {
  multisigProgram: PublicKey;
  multisig: PublicKey;
  multisigSigner: PublicKey;
}
