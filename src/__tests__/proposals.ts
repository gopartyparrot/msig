import { u64 } from "@solana/spl-token";
import { ProposalBase } from "../instructions/ProposalBase";
import { TokenMintToOwner } from "../instructions/TokenMintToOwner";
import { TransferTokenToOwner } from "../instructions/TransferTokenToOwner";
import { knownAccounts } from "./knownAccounts";

export const testProposals: ProposalBase[] = [
  new TokenMintToOwner(
    "2021-11-05T13:31:57+08:00 mint some token to multisigSigner 1",
    {
      mint: knownAccounts.testTokenMint,
      owner: knownAccounts.multisigPDA,
    },
    new u64(1000)
  ),

  new TransferTokenToOwner(
    "2021-11-05T13:33:03+08:00 transfer some test token to memberA from multisig token account 1",
    {
      source: knownAccounts.associatedMultisigTestTokenAccount,
      toOwner: knownAccounts.memberA,
    },
    new u64(100)
  ),
];
