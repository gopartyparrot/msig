import { Program } from "@project-serum/anchor"
import { SolanaProvider } from "@saberhq/solana-contrib"
import { AccountMeta, PublicKey } from "@solana/web3.js"
import { ProposalBase } from "./instructions/ProposalBase"

export type NamedPubkey = { [key: string]: PublicKey | PublicKey[] }

export type MultisigContext = {
  provider: SolanaProvider
  multisigProg: Program
  multisig: PublicKey
  multisigPDA: PublicKey
}

export type MultisigTransactionStruct = {
  multisig: PublicKey
  programId: PublicKey
  accounts: AccountMeta[]
  data: Buffer
  signers: boolean[]
  didExecute: boolean
  ownerSetSeqno: number
}

export type MultisigStruct = {
  owners: PublicKey[]
  threshold: number
  ownerSetSeqno: number
}

export interface IProposals {
  multisig: PublicKey //multisig address(not PDA)
  allowsMap?: Map<string, ProposalBase[]>
  transactions: ProposalBase[]
}

export interface IEnv {
  multisigProgram: PublicKey
}
