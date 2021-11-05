import { Program, Provider } from "@project-serum/anchor";
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { findMultisigSigner } from "../common/utils";
import { TEST_KEYS } from "./keys";

export async function prepareDevnetEnv(program: Program, signer: Keypair) {
  const conn = program.provider.connection;
  const multisigSigner = await findMultisigSigner(
    program.programId,
    TEST_KEYS.multisig.publicKey
  );

  //ensure wallet SOLs
  const walletBalance = await conn.getBalance(
    program.provider.wallet.publicKey
  );
  if (walletBalance < 1) {
    console.log("request airdrop for", signer.publicKey.toBase58());
    await conn.requestAirdrop(signer.publicKey, 1e9);
  }

  //if token not created, creat mint
  const mintAccountSOLBalance = await conn.getBalance(
    TEST_KEYS.testToken.publicKey
  );
  if (mintAccountSOLBalance === 0) {
    console.log(
      "create test token(with owner multisigSigner",
      TEST_KEYS.testToken.publicKey.toBase58()
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
          multisigSigner
        ) //create mint
      ),
      [signer, TEST_KEYS.testToken]
    );
  }
}
