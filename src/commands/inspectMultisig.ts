import { Program } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { findMultisigSigner, MultisigStruct } from ".."

export async function inspectMultisig(multisigProgram: Program, multisig: PublicKey) {
  const state: MultisigStruct = (await multisigProgram.account.multisig.fetch(
    multisig,
  )) as MultisigStruct
  console.log("multisig:", multisig.toBase58(), `(don't send tokens to this address)`)
  console.log("threshold:", state.threshold.toString())
  console.log("ownerSetSeqno:", state.ownerSetSeqno)
  console.log("owners:", state.owners.map((k) => k.toBase58()).join(","))

  const pda = await findMultisigSigner(multisigProgram.programId, multisig)
  console.log("PDA:", pda.toBase58())

  //TODO transactions
}
