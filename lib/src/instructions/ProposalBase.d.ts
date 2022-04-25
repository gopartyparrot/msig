import { Keypair, PublicKey, Signer, TransactionInstruction } from "@solana/web3.js";
import { MultisigContext, MultisigTransactionStruct, NamedPubkey } from "../types";
import { NestedObjectWithPublicKey } from "..";
export declare abstract class ProposalBase {
    memo: string;
    accounts: NamedPubkey | PublicKey[];
    info?: NestedObjectWithPublicKey;
    constructor(memo: string, accounts: NamedPubkey | PublicKey[], //used to create instruction
    info?: NestedObjectWithPublicKey);
    calcAccountWithSeed(seed: string): Keypair;
    calcTransactionAccount(): Keypair;
    verifyTx(ctx: MultisigContext, chainTxState: MultisigTransactionStruct, verbose: boolean): Promise<void>;
    abstract createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
}
export declare type TransactionInstructionExt = {
    multisigInstr: TransactionInstruction;
    prepare?: {
        instructions: TransactionInstruction[];
        signers?: Signer[];
    };
};
//# sourceMappingURL=ProposalBase.d.ts.map