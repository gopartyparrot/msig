## Install

`npm add @parrotfi/msig`

## Use as cli

[`./examples/cli`](./examples/cli)

## Use as sdk

[`./examples/sdk`](./examples/sdk)

## Config

For global options, command line options are used first then env value.

```
msig --help

--rpc RPC_URL (default: https://api.devnet.solana.com)
--wallet WALLET wallet file (default ./id.json)
--program MULTISIG_PROGRAM multisig program
```

env:

```env
MULTISIG_PROGRAM=
RPC_RUL=
WALLET=
```

## Create your multisig

use multisig-ui: https://github.com/project-serum/multisig-ui

use cli: `msig setup --owners memberAPublicKey memberBPublicKey --threshold 2`

## Execute instructions using multisig:

```bash

# create multisig transaction
msig create [proposals.js]

# verify created proposals
msig verify [proposals.js] [--more]

# approve + execute
msig approve [proposals.js] [--more]
```

## Custom instruction

```typescript
import { Token, TOKEN_PROGRAM_ID, u64 } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { ProposalBase } from "@parrotfi/msig";

// extends ProposalBase
export class CustomTokenBurn extends ProposalBase {
  constructor(
    public memo: string,
    public accounts: {
      mint: PublicKey;
      burnFrom: PublicKey;
    },
    public amount: u64
  ) {
    super(memo, accounts); //has memo and accounts
  }

  // implement createInstr
  async createInstr(ctx) {
    return {
      multisigInstr: Token.createBurnInstruction(
        TOKEN_PROGRAM_ID,
        this.accounts.mint,
        this.accounts.burnFrom,
        ctx.multisigPDA,
        [],
        this.amount
      ),
    };
  }
}
```
