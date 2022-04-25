"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeProgram = void 0;
const web3_js_1 = require("@solana/web3.js");
const ProposalBase_1 = require("./ProposalBase");
const BPF_LOADER_UPGRADEABLE_PID = new web3_js_1.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
//untested
class UpgradeProgram extends ProposalBase_1.ProposalBase {
    memo;
    accounts;
    constructor(memo, accounts) {
        super(memo, accounts);
        this.memo = memo;
        this.accounts = accounts;
    }
    async createInstr(ctx) {
        console.log(`
-------------NOTICE: upgrade program start-----------------
it's your work to verify buffer content!
accounts: 0:programDataAddress > 1:program > 2:buffer > 3:spill > 4:sysvarRent > 5:sysvarClock > 6:multisigPDA
-------------NOTICE: upgrade program end-----------------
`);
        const programAccount = await ctx.multisigProg.provider.connection.getAccountInfo(this.accounts.program);
        if (programAccount === null) {
            throw new Error("Invalid program ID");
        }
        const programdataAddress = new web3_js_1.PublicKey(programAccount.data.slice(4));
        const keys = [
            {
                pubkey: programdataAddress,
                isWritable: true,
                isSigner: false,
            },
            { pubkey: this.accounts.program, isWritable: true, isSigner: false },
            { pubkey: this.accounts.buffer, isWritable: true, isSigner: false },
            {
                pubkey: this.accounts.spill,
                isWritable: true,
                isSigner: false,
            },
            { pubkey: web3_js_1.SYSVAR_RENT_PUBKEY, isWritable: false, isSigner: false },
            { pubkey: web3_js_1.SYSVAR_CLOCK_PUBKEY, isWritable: false, isSigner: false },
            { pubkey: ctx.multisigPDA, isWritable: false, isSigner: false },
        ];
        const data = Buffer.from([3, 0, 0, 0]);
        return {
            multisigInstr: new web3_js_1.TransactionInstruction({
                programId: BPF_LOADER_UPGRADEABLE_PID,
                keys,
                data,
            }),
        };
    }
}
exports.UpgradeProgram = UpgradeProgram;
//# sourceMappingURL=UpgradeProgram.js.map