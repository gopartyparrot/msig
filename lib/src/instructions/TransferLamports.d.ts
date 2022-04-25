import { PublicKey } from "@solana/web3.js";
import { MultisigContext } from "../types";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
export declare class TransferLamports extends ProposalBase {
    memo: string;
    receiver: PublicKey;
    lamports: number;
    constructor(memo: string, receiver: PublicKey, lamports: number);
    createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
}
//# sourceMappingURL=TransferLamports.d.ts.map