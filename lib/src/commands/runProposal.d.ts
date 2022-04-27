import { IProposals } from "../types";
interface IOptions {
    multisigProgram?: string;
    dryRun?: boolean;
    verbose?: boolean;
    skipExecute?: boolean;
}
export declare function runProposal(proposal: IProposals, action: "create" | "approve" | "verify" | "execute", opts?: IOptions): Promise<void>;
export {};
//# sourceMappingURL=runProposal.d.ts.map