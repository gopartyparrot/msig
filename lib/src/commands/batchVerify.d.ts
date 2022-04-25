import { ProposalBase } from "../instructions/ProposalBase";
import { MultisigContext, MultisigTransactionStruct } from "../types";
export declare function batchVerifyProposals(ctx: MultisigContext, proposals: ProposalBase[], verbose: boolean): Promise<void>;
export declare function verify(ctx: MultisigContext, proposal: ProposalBase, chainTxState: MultisigTransactionStruct, verbose: boolean): Promise<void>;
//# sourceMappingURL=batchVerify.d.ts.map