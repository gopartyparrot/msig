import { Program } from "@project-serum/anchor";
import { MintLayout, Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { buildMultisigProgram, findMultisigSigner } from "../utils";
import { ProposalBase } from "../instructions/ProposalBase";
import { TokenMintToOwner } from "../instructions/TokenMintToOwner";
import { TransferTokenToOwner } from "../instructions/TransferTokenToOwner";
import { MultisigSetOwnersAndChangeThreshold } from "../instructions/MultisigSetOwnersAndChangeThreshold";

export const TEST_KEYS = {
  memberA: Keypair.fromSecretKey(
    Uint8Array.of(
      ...[
        219, 8, 254, 163, 155, 25, 155, 110, 72, 192, 195, 53, 74, 227, 46, 223,
        247, 114, 225, 158, 156, 213, 28, 88, 228, 40, 26, 247, 227, 40, 150,
        164, 122, 8, 254, 208, 238, 248, 251, 204, 167, 145, 241, 128, 220, 205,
        61, 73, 86, 241, 187, 4, 176, 92, 155, 68, 33, 107, 206, 212, 251, 4,
        129, 223,
      ],
    ),
  ), //9DNhHuvCFLCFzPkaRrwv1Wt8DQucwRgQmgagq7eE3Qq4
  memberB: Keypair.fromSecretKey(
    Uint8Array.of(
      ...[
        159, 135, 66, 80, 120, 230, 27, 163, 222, 221, 2, 17, 177, 125, 63, 149,
        153, 198, 18, 162, 39, 166, 195, 160, 13, 92, 116, 120, 0, 2, 11, 97,
        190, 3, 10, 162, 113, 93, 141, 99, 230, 114, 193, 167, 28, 155, 67, 202,
        196, 251, 252, 228, 28, 68, 92, 100, 157, 244, 148, 41, 69, 5, 205, 197,
      ],
    ),
  ), //Dnj9r7FgZ6a54E8VVjc1FgagR7JjBzDnV5ATnCXwmm6t
  multisig: Keypair.fromSecretKey(
    Uint8Array.of(
      ...[
        18, 71, 26, 48, 14, 164, 190, 222, 203, 79, 121, 229, 163, 188, 226,
        253, 19, 153, 188, 185, 8, 237, 83, 209, 33, 181, 54, 178, 42, 235, 92,
        69, 69, 118, 196, 166, 97, 68, 77, 29, 227, 115, 157, 113, 241, 17, 168,
        185, 40, 149, 77, 56, 60, 240, 176, 24, 193, 108, 112, 65, 134, 218, 98,
        48,
      ],
    ),
  ), //5gAAsvqvDdsgC9TE61TF45ZZg3UjjYhwkgn5HfRY6oa7, multisigSigner: 68uDBL29s3uf98FAM1XQmfozHstPPKk68x5x2Hz88Qmb
  testToken: Keypair.fromSecretKey(
    Uint8Array.of(
      ...[
        10, 79, 236, 253, 170, 206, 44, 76, 10, 162, 45, 189, 125, 253, 193,
        157, 131, 204, 248, 224, 123, 46, 148, 193, 52, 162, 119, 102, 179, 238,
        81, 95, 112, 102, 239, 75, 188, 28, 234, 240, 151, 112, 192, 65, 255,
        86, 184, 250, 83, 235, 148, 198, 115, 184, 223, 29, 7, 207, 210, 50, 40,
        133, 140, 192,
      ],
    ),
  ), //8ZmhVd4YUqHhGGo7bAVaDxD6zDtCnfhG98EL6fCaHqGj
};

export const knownAccounts = {
  testTokenMint: TEST_KEYS.testToken.publicKey,
  multisigPDA: new PublicKey("68uDBL29s3uf98FAM1XQmfozHstPPKk68x5x2Hz88Qmb"),

  memberA: TEST_KEYS.memberA.publicKey,
  associatedMultisigTestTokenAccount: new PublicKey(
    "38KWFstDdt7HhM1d26JrH6Tcvw4VGoW4rJNEjoDcymuF",
  ),
};

export const testProposals: ProposalBase[] = [
  new TokenMintToOwner(
    "2021-11-05T13:31:57+08:00 mint some token to multisigSigner 1",
    {
      mint: knownAccounts.testTokenMint,
      owner: knownAccounts.multisigPDA,
    },
    new u64(1000),
  ),

  new TransferTokenToOwner(
    "2021-11-05T13:33:03+08:00 transfer some test token to memberA from multisig token account 1",
    {
      mint: knownAccounts.testTokenMint,
      toOwner: knownAccounts.memberA,
    },
    new u64(100),
  ),

  new MultisigSetOwnersAndChangeThreshold(
    "2021-11-09T11:25:33+08:00, transfer owner(unchanged)",
    [
      new PublicKey(TEST_KEYS.memberA.publicKey.toBase58()),
      new PublicKey(TEST_KEYS.memberB.publicKey.toBase58()),
    ],
    2,
  ),
];

export async function ensureDevnetEnv(program: Program, signer: Keypair) {
  const conn = program.provider.connection;
  const multisigSigner = await findMultisigSigner(
    program.programId,
    TEST_KEYS.multisig.publicKey,
  );

  //ensure wallet SOLs
  const walletBalance = await conn.getBalance(
    program.provider.wallet.publicKey,
  );
  if (walletBalance < 1) {
    console.log("request airdrop for", signer.publicKey.toBase58());
    await conn.requestAirdrop(signer.publicKey, 1e9);
  }

  //if token not created, creat mint
  const mintAccountSOLBalance = await conn.getBalance(
    TEST_KEYS.testToken.publicKey,
  );
  if (mintAccountSOLBalance === 0) {
    console.log(
      "create test token(with owner multisigSigner",
      TEST_KEYS.testToken.publicKey.toBase58(),
    );
    await program.provider.send(
      new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: signer.publicKey,
          newAccountPubkey: TEST_KEYS.testToken.publicKey,
          lamports: await Token.getMinBalanceRentForExemptMint(conn),
          space: MintLayout.span,
          programId: TOKEN_PROGRAM_ID,
        }),
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          TEST_KEYS.testToken.publicKey,
          6,
          multisigSigner,
          multisigSigner,
        ), //create mint
      ),
      [signer, TEST_KEYS.testToken],
    );
  }
}

export function getDevnetProgramFromEnvWithWallet(wallet: Keypair): Program {
  return buildMultisigProgram(
    "https://api.devnet.solana.com",
    new PublicKey("msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt"),
    wallet,
  );
}
