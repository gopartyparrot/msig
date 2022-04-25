import { u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "../types";
export declare class TransferToken extends ProposalBase {
    memo: string;
    accounts: {
        source: PublicKey;
        destination: PublicKey;
    };
    amount: u64;
    constructor(memo: string, accounts: {
        source: PublicKey;
        destination: PublicKey;
    }, amount: u64);
    createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
}
//# sourceMappingURL=TransferToken.d.ts.map