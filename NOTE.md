- think of a name
  - @parrotfi/msig
- publish this library as an npm package
  - compile to `lib` path
- when packaging, include both src and lib
- load proposals and accounts as commonjs modules (using `require`)

# Install

```
npm add -g @parrotfi/msig
```

# Config

```
msig --help

--rpc RPC_URL (default: https://api.devnet.solana.com)
--accounts ACCOUNTS trusted accounts (default ./accounts.js)
--wallet WALLET wallet file (default ./id.json)
```

or using .env

```
RPC_RUL=https://api.devnet.solana.com
WALLET=./id.json
```

# Create Multisig Wallet

```
msig setup --threshold 2 KEY1 KEY2 KEY3 KEY4

txid: TXTX...TXTX

msig wallet address (⚠️⚠️⚠️ don't send tokens to this address ⚠️⚠️⚠️):
AZAZ...AZAZ

msig wallet PDA (send tokens here):
AZAZ...AZAZ
```

# Create Mint with Multisig

# Send tokens to PDA

send 1 usdc to msig PDA

# Create Proposals

```
msig create proposals.js
```

# Verify and Execute Proposals

```
msig verify proposals.js
msig execute proposals.js
```

# Devnet Example
