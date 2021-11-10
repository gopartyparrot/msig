import { u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  ProposalBase,
  TokenMintToOwner,
  TransferTokenToOwner,
} from "@parrotfi/msig";
import { accounts } from "./accounts";
import { CustomTokenBurn } from "./customProposal";

import util from "util";

export const PROPOSALS: ProposalBase[] = [
  //example proposals
  new TokenMintToOwner(
    "2021-11-08T20:10:17+08:00 mint some token to multisigSigner 1", //FIXME: to run the example you need to modify proposal memo
    {
      mint: accounts.testTokenMint,
      owner: accounts.multisigPDA,
    },
    new u64(1000),
  ),

  new TransferTokenToOwner(
    "2021-11-08T20:10:17+08:00 transfer some test token to memberA from multisig token account 1", //FIXME: to run the example you need to modify proposal memo
    {
      mint: accounts.testTokenMint,
      toOwner: accounts.memberA,
    },
    new u64(100),
  ),

  new CustomTokenBurn(
    "2021-11-08T20:10:17+08:00 custom instruction burn token from multisig", //FIXME: to run the example you need to modify proposal memo
    {
      mint: accounts.testTokenMint,
      burnFrom: accounts.associatedMultisigTestTokenAccount,
    },
    new u64(2),
  ),
];

/** better json print for PublicKey */
export function setupJSONPrint() {
  PublicKey.prototype["toJSON"] = function () {
    return this.toBase58();
  };

  PublicKey.prototype[util.inspect.custom] = function () {
    return this.toBase58();
  };
}
