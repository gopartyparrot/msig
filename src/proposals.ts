import { u64 } from "@solana/spl-token";
import assert from "assert";
import { ProposalBase } from "./instructions/ProposalBase";
import { TokenMintToOwner } from "./instructions/TokenMintToOwner";
import { TransferTokenToOwner } from "./instructions/TransferTokenToOwner";
import { knownAccounts } from "./knownAccounts";

export var PROPOSALS: ProposalBase[] = [
  //example proposals
  new TokenMintToOwner(
    "2021-11-05T14:38:08+08:00 mint some token to multisigSigner 1",
    {
      mint: knownAccounts.testTokenMint,
      owner: knownAccounts.multisigPDA,
    },
    new u64(1000)
  ),

  new TransferTokenToOwner(
    "2021-11-05T14:38:14+08:00 transfer some test token to memberA from multisig token account 1",
    {
      source: knownAccounts.associatedMultisigTestTokenAccount,
      toOwner: knownAccounts.memberA,
    },
    new u64(100)
  ),
];

// this func is used in tests, PROPOSALS should be a const
export function setProposals(proposals: ProposalBase[]) {
  PROPOSALS = proposals;
}

// should check that `memo` is unique for each item in the proposal array
(function () {
  assert(
    new Set(PROPOSALS.map((x) => x.memo)).size == PROPOSALS.length,
    "duplicated key for multisig transactions"
  );
})();
