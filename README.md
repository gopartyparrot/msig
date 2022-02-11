# Parrot Multisig Toolkit

Parrot's multisig workflow

- makes it easier to audit instruction data and account inputs using a whitelist
- makes it easy to verify and approve multiple multisig transactions at once
- extends the multisig workflow with application specific instructions

# Tutorial

- Generate three wallets to become the signers of a multisig
- Create a 2/3 multisig
- Send 1 USDC to the multisig
- Send 1 USDC from the multisig to a receiving wallet
  - Use key1 to create the multisig transaction
  - Use key2 to approve and execute the multisig transaction

## Create Wallets

If you have existing wallets you can use those, or you can generate new ones by using the `genkey` command.

Let's generate a keyfile called `id1.json`:

```
msig genkey id1.json
```

```
Public key:
FGeVJVMUBX4GmYghZR9e7FqCa8FVZmqJsqczxxauKTjb
Private key (hex):
c40a398d04d4c7bce56b5593c844ad4ce0eb2dc9316c67ea18add4ff57e41637d405b7850880cc49cc109f276cec448cc0859d6656dc59eaa77515dc30d3073e
Private key (json):
[
  196,  10,  57, 141,   4, 212, 199, 188, 229, 107,  85,
  147, 200,  68, 173,  76, 224, 235,  45, 201,  49, 108,
  103, 234,  24, 173, 212, 255,  87, 228,  22,  55, 212,
    5, 183, 133,   8, 128, 204,  73, 204,  16, 159,  39,
  108, 236,  68, 140, 192, 133, 157, 102,  86, 220,  89,
  234, 167, 117,  21, 220,  48, 211,   7,  62
]
```

You would get a different address and private key. Keep the keyfile and private key secure!

Use the same command to generate two more keys:

```
msig genkey id2.json
```

```
msig genkey id3.json
```

For testing purposes, you could generate all three keys locally. For a production multisig, each participant should generate their own key.

## Create A Multisig

Let's setup a 2/3 wallet with the following keys:

```
id1: 9GFcTi42f7fdCFhSoA7Ycqr64PbUAPnot77fqwoq3MGn
id2: ABvMxYveW9V8CXa5thSzGENEGbrktC652WxPfiX9HQ8o
id3: Cq3tX7P3vThPG8Rk39toQfgAUzpHY5xZMt9UT7gTVBc7
```

Use `id1.json` as the wallet to create a 2/3 multisig, with the pubkeys that you'd want to use:

```
# replace the pubkeys with your own

msig setup --wallet id1.json --threshold 2 --owners \
  9GFcTi42f7fdCFhSoA7Ycqr64PbUAPnot77fqwoq3MGn \
  ABvMxYveW9V8CXa5thSzGENEGbrktC652WxPfiX9HQ8o \
  Cq3tX7P3vThPG8Rk39toQfgAUzpHY5xZMt9UT7gTVBc7
```

Once the transaction is confirmed, you'd get a multisig address, and a multisig PDA:

```
msig wallet address (don't send tokens to this address):
9he5FHBkLtEFGQeBA6xBubWbbYoAdAX3DrjAmEiUvi7S

msig wallet PDA (send tokens here):
D6D7ADuNvKgAJkai9AURfGHjKBK4iMZxxvcAYMhiuDE1
```

The multisig PDA is the address where you can send tokens, or use as the authority signer for various instructions.

Inspect the multisig address with the `info` command:

```
multisig: 9he5FHBkLtEFGQeBA6xBubWbbYoAdAX3DrjAmEiUvi7S (don't send tokens to this address)
threshold: 2
ownerSetSeqno: 0
owners: 9GFcTi42f7fdCFhSoA7Ycqr64PbUAPnot77fqwoq3MGn,ABvMxYveW9V8CXa5thSzGENEGbrktC652WxPfiX9HQ8o,Cq3tX7P3vThPG8Rk39toQfgAUzpHY5xZMt9UT7gTVBc7
PDA: D6D7ADuNvKgAJkai9AURfGHjKBK4iMZxxvcAYMhiuDE1
```

And it should display the same info as you have specified.

## Send 1 USDC To The Multisig

The "multisig PDA" is the address that acts as the signer of the multisig. You can treat it like a wallet public address, and send tokens to it.

Here is an example transaction of sending 1 USDC to the multisig PDA:

https://solscan.io/tx/5jqCRbSd8PbBU5cJgdL1bw3YvqXHpGPeAwmFYaJVzGxDu7swZBwxH2frt6bbC6fAwGZhsuxjFdDT4tfhvJyDR2ag

## Create Proposals

Let's create proposals to transfer USDC tokens out of the multisig to the `id1` wallet. This multisig tool is designed to make it easy to create, verify, and approve multiple transactions at once. So let's try to create 2 separate transactions to send out USDC:

```js
const { u64 } = require("@solana/spl-token")
const { PublicKey } = require("@solana/web3.js")
const { TransferTokenToOwner } = require("@parrotfi/msig")

// Maintain known/verified addresses, to make it easier to review proposed
// transactions.
const known = {
  mints: {
    usdc: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  },

  wallets: {
    parrot: new PublicKey("9GFcTi42f7fdCFhSoA7Ycqr64PbUAPnot77fqwoq3MGn"),
  },
}

module.exports = {
  multisig: new PublicKey("9he5FHBkLtEFGQeBA6xBubWbbYoAdAX3DrjAmEiUvi7S"),

  transactions: [
    new TransferTokenToOwner(
      // The memo string must be unique for a multisig. Use a timestamp as
      // prefix (by convention) to ensure its uniqueness.
      "2021-11-08T20:02:28+08:00 transfer 0.3",
      {
        mint: known.mints.usdc,
        toOwner: known.wallets.parrot,
      },
      new u64(0.3 * 1e6), // 0.3 USDC
    ),
    new TransferTokenToOwner(
      // The memo string must be unique for a multisig. Use a timestamp as
      // prefix (by convention) to ensure its uniqueness.
      "2021-11-08T20:02:28+08:00 transfer 0.7",
      {
        mint: known.mints.usdc,
        toOwner: known.wallets.parrot,
      },
      new u64(0.7 * 1e6), // 0.7 USDC
    ),
  ],
}
```

Then use the `create` command to create these multisig transactions:

```
msig --wallet id1.json create proposals.js
```

You should see that the multisig transactions have been created, and are pending
approval:

```
create multisig tx:  3UG14FnQqkovUnBmqVxV1J6VUBJTMJB3yoFniKkN5Q2u {
  "memo": "2021-11-08T20:02:28+08:00 transfer 0.3",
  "accounts": {
    "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "toOwner": "9GFcTi42f7fdCFhSoA7Ycqr64PbUAPnot77fqwoq3MGn"
  },
  "amount": "0493e0"
}
0  Cddq98QAr8yokd9dfMA6eTnFducVSrMd7RRSAiYrmkb   w: y s: n
1  A7ZKwPkya1h4PsJdjD9PjaYR1gtPVt4DnnVtULYxKspq  w: y s: n
2  D6D7ADuNvKgAJkai9AURfGHjKBK4iMZxxvcAYMhiuDE1  w: n s: y

create multisig tx:  FKZQ3hNg1Uq85yMNGHjQxJi2LQFRdBgygxoZs4Y36fdM {
  "memo": "2021-11-08T20:02:28+08:00 transfer 0.7",
  "accounts": {
    "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "toOwner": "9GFcTi42f7fdCFhSoA7Ycqr64PbUAPnot77fqwoq3MGn"
  },
  "amount": "0aae60"
}
0  Cddq98QAr8yokd9dfMA6eTnFducVSrMd7RRSAiYrmkb   w: y s: n
1  A7ZKwPkya1h4PsJdjD9PjaYR1gtPVt4DnnVtULYxKspq  w: y s: n
2  D6D7ADuNvKgAJkai9AURfGHjKBK4iMZxxvcAYMhiuDE1  w: n s: y
```

## Verify Proposals

The first wallet has created the transaction, now another owner of the multisig needs to verify and approve the transactions.

Given the same `proposals.js`, the second wallet can should verify that the multisig transactions created on-chain indeed have the right input accounts, and the correct instruction data:

```
msig --wallet id2.json verify proposals.js

=======>> verify 2021-11-08T20:02:28+08:00 transfer 0.3 3UG14FnQqkovUnBmqVxV1J6VUBJTMJB3yoFniKkN5Q2u
 PASSED
=======>> verify 2021-11-08T20:02:28+08:00 transfer 0.7 FKZQ3hNg1Uq85yMNGHjQxJi2LQFRdBgygxoZs4Y36fdM
 PASSED
```

We see that the verifications have passed.

## Approve Proposals

Once verified, the second signer can choose to approve the transaction. Note that if the treshold is reached, this command would also execute the transactions:

```
msig --wallet id2.json approve proposals.js
```

```
======>> approve/execute 2021-11-08T20:02:28+08:00 transfer 0.3 3UG14FnQqkovUnBmqVxV1J6VUBJTMJB3yoFniKkN5Q2u
=======>> verify 2021-11-08T20:02:28+08:00 transfer 0.3 3UG14FnQqkovUnBmqVxV1J6VUBJTMJB3yoFniKkN5Q2u
 PASSED
execute txid: Xfm347vyzChLFSThkEqXPnSzdjc6Z3QBBvZoDkN9tQm3yoxn4ZQd5kskb3fRZ2hSEnZKtynLeNW1h1fQWsrWR1K
======>> approve/execute 2021-11-08T20:02:28+08:00 transfer 0.7 FKZQ3hNg1Uq85yMNGHjQxJi2LQFRdBgygxoZs4Y36fdM
=======>> verify 2021-11-08T20:02:28+08:00 transfer 0.7 FKZQ3hNg1Uq85yMNGHjQxJi2LQFRdBgygxoZs4Y36fdM
 PASSED
execute txid: 2yGrmQHV2KCSjSmJjymekG226fWL3TcEShiy7VhEe3RbRv3RHqDWtEDEF5FPs7XSTe1VeZQL3n7CXJvGca1hZW8Z
```

If you dig into the actual transactions, you would see that the multisig PDA is used to authorize the USDC transfer.

Also, since the transactions have already been executed, they would be skipped if encountered again:

```
msig --wallet id2.json verify proposals.js

2021-11-08T20:02:28+08:00 transfer 0.3 already executed, skip verify
2021-11-08T20:02:28+08:00 transfer 0.7 already executed, skip verify
```

Each multisig proposal would never be executed more than once.
