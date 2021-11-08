const { PublicKey } = require("@solana/web3.js");

module.exports = {
  testTokenMint: new PublicKey("8ZmhVd4YUqHhGGo7bAVaDxD6zDtCnfhG98EL6fCaHqGj"),
  multisigPDA: new PublicKey("68uDBL29s3uf98FAM1XQmfozHstPPKk68x5x2Hz88Qmb"),

  memberA: new PublicKey("9DNhHuvCFLCFzPkaRrwv1Wt8DQucwRgQmgagq7eE3Qq4"),

  associatedMultisigTestTokenAccount: new PublicKey(
    "38KWFstDdt7HhM1d26JrH6Tcvw4VGoW4rJNEjoDcymuF"
  ),
};