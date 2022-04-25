/// <reference types="node" />
import { MultipleWalletProvider } from "@parrotfi/core-sdk";
import { Program } from "@project-serum/anchor";
import { AccountMeta, PublicKey } from "@solana/web3.js";
import { ProposalBase } from "./instructions/ProposalBase";
export declare type NamedPubkey = {
    [key: string]: PublicKey | PublicKey[];
};
export declare type MultisigContext = {
    provider: MultipleWalletProvider;
    multisigProg: Program;
    multisig: PublicKey;
    multisigPDA: PublicKey;
};
export declare type MultisigTransactionStruct = {
    multisig: PublicKey;
    programId: PublicKey;
    accounts: AccountMeta[];
    data: Buffer;
    signers: boolean[];
    didExecute: boolean;
    ownerSetSeqno: number;
};
export declare type MultisigStruct = {
    owners: PublicKey[];
    threshold: number;
    ownerSetSeqno: number;
};
export interface IProposals {
    multisig: PublicKey;
    allowsMap?: Map<string, ProposalBase[]>;
    transactions: ProposalBase[];
}
export interface IEnv {
    multisigProgram: PublicKey;
}
//# sourceMappingURL=types.d.ts.map