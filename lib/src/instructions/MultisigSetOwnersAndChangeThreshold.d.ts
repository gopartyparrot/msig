import { PublicKey } from "@solana/web3.js";
import { ProposalBase } from "./ProposalBase";
import { MultisigContext } from "../types";
import { TransactionInstructionExt } from "./ProposalBase";
export declare class MultisigSetOwnersAndChangeThreshold extends ProposalBase {
    memo: string;
    owners: PublicKey[];
    threshold: number;
    constructor(memo: string, owners: PublicKey[], threshold: number);
    createInstr(ctx: MultisigContext): Promise<TransactionInstructionExt>;
}
//# sourceMappingURL=MultisigSetOwnersAndChangeThreshold.d.ts.map