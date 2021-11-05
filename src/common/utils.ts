import { Program, Provider, Wallet } from "@project-serum/anchor";
import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { ENV } from "../env";
import { ProposalBase } from "../instructions/ProposalBase";
import {
  AccountState,
  IEnvPublicKeys,
  MultisigStruct,
  MultisigTransactionStruct,
} from "../instructions/types";
import util from "util";

import multisigIdl from "./serum_multisig_idl.json"; //TODO

export function printKeys(keys: Array<AccountMeta>) {
  for (let i = 0; i < keys.length; i++) {
    const { pubkey, isWritable, isSigner } = keys[i];
    console.log(
      `${i}  ${pubkey.toBase58().padEnd(45, " ")} w: ${boolStr(
        isWritable
      )} s: ${boolStr(isSigner)}`
    );
  }
  console.log("");
}

export function boolStr(b: boolean): string {
  return b ? "y" : "n";
}

export async function getProposalsChainStates(
  multisigProg: Program,
  proposals: ProposalBase[]
) {
  const txPubkeys = proposals.map((p) => p.calcTransactionAccount().publicKey);
  const chainTransactions: AccountState<MultisigTransactionStruct>[] = (
    await multisigProg.provider.connection.getMultipleAccountsInfo(txPubkeys)
  ).map((a, idx): AccountState<MultisigTransactionStruct> => {
    return {
      pubkey: txPubkeys[idx],
      state: !a
        ? null
        : multisigProg.coder.accounts.decode("Transaction", a.data),
    };
  });
  return chainTransactions;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getProgramWithEnvWallet(): Program {
  const payer = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        readFileSync(ENV.walletPath, {
          encoding: "utf-8",
        })
      )
    )
  );
  return getProgramFromEnv(payer);
}
export function getProgramFromEnv(payer: Keypair): Program {
  const opts = Provider.defaultOptions();
  const connection = new Connection(ENV.rpcUrl, opts.preflightCommitment);
  const provider = new Provider(connection, new NodeWallet(payer), opts);
  return new Program(multisigIdl as any, ENV.multisigProgram, provider);
}

export async function findMultisigSigner(
  multisigProgram: PublicKey,
  multisigAddress: PublicKey
) {
  const [multisigSigner, nonce] = await PublicKey.findProgramAddress(
    [multisigAddress.toBuffer()],
    multisigProgram
  );
  return multisigSigner;
}

export async function getEnvPublicKeys(): Promise<IEnvPublicKeys> {
  return {
    multisigProgram: ENV.multisigProgram,
    multisig: ENV.multisigAddress,
    multisigSigner: await findMultisigSigner(
      ENV.multisigProgram,
      ENV.multisigAddress
    ),
  };
}

export function assertProposerIsOwnerOfMultisig(
  proposerPubkey: PublicKey,
  multisig: MultisigStruct
) {
  for (const owner of multisig.owners) {
    if (owner.equals(proposerPubkey)) {
      return;
    }
  }
  throw Error(`${proposerPubkey.toBase58()} is not owner of multisig`);
}

//copied from anchor
export class NodeWallet implements Wallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}

// better json print for PublicKey/BN
export function setupJSONPrint() {
  PublicKey.prototype["toJSON"] = function () {
    return this.toBase58();
  };

  PublicKey.prototype[util.inspect.custom] = function () {
    return this.toBase58();
  };
}
