import { MultipleWalletProvider } from "@parrotfi/common"
import { Program } from "@project-serum/anchor"
import { AccountMeta, PublicKey } from "@solana/web3.js"
import { ProposalBase } from "./instructions/ProposalBase"

export type NamedPubkey = { [key: string]: PublicKey | PublicKey[] }

export type MultisigContext = {
  provider: MultipleWalletProvider
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
  transactions: ProposalBase[]
}

export interface IEnv {
  multisigProgram: PublicKey
}
