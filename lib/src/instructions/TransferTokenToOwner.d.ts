import { u64 } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "../types";
export declare class TransferTokenToOwner extends ProposalBase {
    memo: string;
    accounts: {
        mint: PublicKey;
        toOwner: PublicKey;
    };
    amount: u64;
    constructor(memo: string, accounts: {
        mint: PublicKey;
        toOwner: PublicKey;
    }, amount: u64);
    createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
    getTokenAccountMint(conn: Connection, tokenAcc: PublicKey): Promise<PublicKey>;
}
//# sourceMappingURL=TransferTokenToOwner.d.ts.map