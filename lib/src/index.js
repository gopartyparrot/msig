"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchApproveExecuteProposals = exports.batchCreateProposals = exports.batchVerifyProposals = exports.inspectMultisig = exports.setupMultisig = void 0;
var setupMultisig_1 = require("./commands/setupMultisig");
Object.defineProperty(exports, "setupMultisig", { enumerable: true, get: function () { return setupMultisig_1.setupMultisig; } });
var inspectMultisig_1 = require("./commands/inspectMultisig");
Object.defineProperty(exports, "inspectMultisig", { enumerable: true, get: function () { return inspectMultisig_1.inspectMultisig; } });
var batchVerify_1 = require("./commands/batchVerify");
Object.defineProperty(exports, "batchVerifyProposals", { enumerable: true, get: function () { return batchVerify_1.batchVerifyProposals; } });
var batchCreate_1 = require("./commands/batchCreate");
Object.defineProperty(exports, "batchCreateProposals", { enumerable: true, get: function () { return batchCreate_1.batchCreateProposals; } });
var batchApproveExecute_1 = require("./commands/batchApproveExecute");
Object.defineProperty(exports, "batchApproveExecuteProposals", { enumerable: true, get: function () { return batchApproveExecute_1.batchApproveExecuteProposals; } });
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./instructions"), exports);
//# sourceMappingURL=index.js.map