import { Program, Wallet } from "@project-serum/anchor";
import { AccountInfo, AccountMeta, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { MultipleWalletProvider } from "@parrotfi/core-sdk";
import { ProposalBase } from "./instructions/ProposalBase";
import { MultisigStruct, MultisigTransactionStruct } from "./types";
import { IEnv, MultisigContext } from ".";
export declare function printKeys(keys: Array<AccountMeta>): void;
interface NestedObject<T> extends Record<string, T | NestedObject<T>> {
}
export interface NestedObjectWithPublicKey extends NestedObject<PublicKey> {
}
export declare function printNestedObjectWithPublicKey(obj: NestedObjectWithPublicKey): void;
export declare function fetchProposalsChainStates(multisigProg: Program, proposals: ProposalBase[]): Promise<(AccountInfo<MultisigTransactionStruct> | null)[]>;
export declare function sleep(ms: number): Promise<unknown>;
export declare function buildMultisigProgram(provider: MultipleWalletProvider, multisigProgramId: PublicKey): Program;
export declare function getWalletFromFile(path: string): Keypair;
export declare function getProgramFromEnv(ev: IEnv): Program;
export declare function findMultisigSigner(multisigProgram: PublicKey, multisigAddress: PublicKey): Promise<PublicKey>;
export declare function getMultisigContext(program: Program, multisigAddress: PublicKey): Promise<MultisigContext>;
export declare function assertProposerIsOwnerOfMultisig(proposerPubkey: PublicKey, multisig: MultisigStruct): void;
export declare class NodeWallet implements Wallet {
    readonly payer: Keypair;
    constructor(payer: Keypair);
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
    get publicKey(): PublicKey;
}
/** better json print for PublicKey */
export declare function setupJSONPrint(publicKeyClass: any): void;
export declare function ensureProposalsMemoUnique(proposals: ProposalBase[]): void;
/**
 * console log publicKey like
 *  ` {
        "_bn": "83b2e6cdef2e3686db68c8b5b144e7e3bdc8b445eb19fc04aa046b794d11d0bb"
      },`
 * this function try to avoid this by convert public key to base58 string
 */
export declare function betterPrintObjectWithPublicKey(obj: any): void;
export declare function printProposalCreationState(status: Map<string, string>): void;
export {};
//# sourceMappingURL=utils.d.ts.map