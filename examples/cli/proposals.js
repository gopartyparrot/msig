const { u64 } = require("@solana/spl-token")
const { PublicKey } = require("@solana/web3.js")
const { TokenMintToOwner, TransferTokenToOwner } = require("@parrotfi/msig")

const CustomTokenBurn = require("./customProposal")

const accounts = require("./accounts")

module.exports = {
  // default to "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"
  // program: "msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"

  multisig: new PublicKey("5gAAsvqvDdsgC9TE61TF45ZZg3UjjYhwkgn5HfRY6oa7"),

  transactions: [
    new TokenMintToOwner(
      "2021-11-08T20:02:23+08:00 mint some token to multisigSigner 1", //FIXME: to run the example, you need to modify memo
      {
        mint: accounts.testTokenMint,
        owner: accounts.multisigPDA,
      },
      new u64(1000),
    ),

    new TransferTokenToOwner(
      "2021-11-08T20:02:28+08:00 transfer some test token to memberA from multisig token account 1", //FIXME: to run the example, you need to modify memo
      {
        source: accounts.associatedMultisigTestTokenAccount,
        toOwner: accounts.memberA,
      },
      new u64(100),
    ),

    new CustomTokenBurn(
      "2021-11-08T20:02:32+08:00 custom instr: burn token from multisig", //FIXME: to run the example, you need to modify memo
      {
        mint: accounts.testTokenMint,
        burnFrom: accounts.associatedMultisigTestTokenAccount,
      },
      new u64(2),
    ),
  ],
}
