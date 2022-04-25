import { u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "../types";
export declare class TokenMintTo extends ProposalBase {
    memo: string;
    accounts: {
        mint: PublicKey;
        destination: PublicKey;
    };
    amount: u64;
    constructor(memo: string, accounts: {
        mint: PublicKey;
        destination: PublicKey;
    }, amount: u64);
    createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
}
//# sourceMappingURL=TokenMintTo.d.ts.map