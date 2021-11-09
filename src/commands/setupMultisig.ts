import { BN, Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import assert from "assert";

export async function createMultisig(
  multisigProgram: Program,
  threshold: number,
  members: string[],
  multisig?: Keypair,
) {
  const owners = members.map((m) => new PublicKey(m));
  assert(owners.length >= threshold, "threshold must gt owners.length");
  const multisigSize = 8 + 4 + owners.length * 32 + 16;
  if (!multisig) {
    multisig = Keypair.generate();
  }
  const currentMultisigBalance =
    await multisigProgram.provider.connection.getBalance(multisig.publicKey);
  if (currentMultisigBalance > 0) {
    console.log("multisig account already exists");
    return;
  }

  const [multisigSigner, nonce] = await PublicKey.findProgramAddress(
    [multisig.publicKey.toBuffer()],
    multisigProgram.programId,
  );

  const txid = await multisigProgram.rpc.createMultisig(
    owners,
    new BN(threshold),
    nonce,
    {
      accounts: {
        multisig: multisig.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
      },
      instructions: [
        await multisigProgram.account.multisig.createInstruction(
          multisig,
          multisigSize,
        ),
      ],
      signers: [multisig],
    },
  );
  console.log("txid:", txid);
  console.log("msig wallet address (don't send tokens to this address):");
  console.log(multisig.publicKey.toBase58());
  console.log("msig wallet PDA (send tokens here):");
  console.log(multisigSigner.toBase58());
}
