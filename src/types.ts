import { Program } from "@project-serum/anchor";
import { AccountMeta, PublicKey } from "@solana/web3.js";
import { ProposalBase } from "./instructions";

export type NamedPubkey = { [key: string]: PublicKey };

export type MultisigContext = {
  multisigProg: Program;
  multisigPDA: PublicKey;
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

export type MultisigStruct = {
  owners: PublicKey[];
  threshold: number;
  ownerSetSeqno: number;
};

export interface IEnvPublicKeys {
  multisig: PublicKey;
  multisigSigner: PublicKey;
}

export interface IProposals {
  multisig: PublicKey; //multisig address(not PDA)
  transactions: ProposalBase[];
}
