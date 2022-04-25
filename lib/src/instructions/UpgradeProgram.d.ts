import { PublicKey } from "@solana/web3.js";
import { ProposalBase, TransactionInstructionExt } from "./ProposalBase";
import { MultisigContext } from "../types";
export declare class UpgradeProgram extends ProposalBase {
    memo: string;
    accounts: {
        program: PublicKey;
        buffer: PublicKey;
        spill: PublicKey;
    };
    constructor(memo: string, accounts: {
        program: PublicKey;
        buffer: PublicKey;
        spill: PublicKey;
    });
    createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
}
//# sourceMappingURL=UpgradeProgram.d.ts.map