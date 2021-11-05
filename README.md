# usage

## quick experience using tests code (on devnet )

a 2/3 multisig already exists on devnet, keys in [`src/__tests__/keys.ts`](src/__tests__/keys.ts)

```bash

npm install

# you can run all commands  multiple times, it's safe

# create multisig
# since multisig on devnet already created, this action wont do anything actually
# if you still want to create a new multisig, modify TEST_KEYS in `src/__tests__/keys` and `src/__tests__/knownAccounts.ts`
jest --testTimeout 500000 src/__tests__/createMultisig.spec.ts


# modify memo (current memo in this repo has been used) in `src/__tests__/proposals.ts`, better to modify time

# create multisig proposals with memberA
jest --testTimeout 500000 src/__tests__/create.spec.ts

# verify created proposals with memberB
jest --testTimeout 500000 src/__tests__/verify.spec.ts

# approve + execute transaction with memberB
jest --testTimeout 500000 src/__tests__/execute.spec.ts
```

## quick experience using cli (on devnet)

```bash
cp .env.example .env
touch id.json
vi id.json #use memberA in `src/__tests__/keys.ts

cp src/knownAccounts.example.ts src/knownAccounts.ts

# then modify memo in `src/proposals.ts`

# create multisig transactions
npm start create

# switch to memberB
vi id.json #use memberB in `src/__tests__/keys.ts

# verify with memberB, proposals should passed
npm start verify -- --more

# approve and execute proposals
npm start execute -- --more
```

## create your multisig

use multisig-ui: https://github.com/project-serum/multisig-ui

use cli: `npm start new -- --owners memberAPublicKey,memberBPublicKey --threshold 2`

## execute instructions using multisig:

prepare:

```bash
cp .env.example .env
# modify your config .env

# prepare your knownAccounts
cp src/knownAccounts.example.ts src/knownAccounts.ts
```

create multisig transaction from proposals:

```bash
# create multisig transactions
npm start create
```

approve + execute:

```bash
# verify created proposals
npm start verify -- --more

# approve and execute proposals
npm start execute -- --more
```

**NOTICE**:

- **don't** submit your `src/knownAccounts.ts` to git
- **don't** submit your private key to git
