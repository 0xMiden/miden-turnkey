# Miden × Turnkey Integration

A Next.js application demonstrating integration between Miden blockchain and Turnkey's embedded wallet infrastructure.

## How It Works

### Core Integration

The integration uses a custom React hook (`useMiden`) that bridges Turnkey's wallet signing with Miden's client:

```typescript
// hooks/use-miden.ts
export const useMiden = () => {
  const { wallets, httpClient, handleSignMessage } = useTurnkey();

  useEffect(() => {
    const loadClient = async () => {
      const { client, accountId } = await createMidenTurnkeyClient(
        {
          client: httpClient,
          signWith: embeddedWallets[0].accounts[0],
          organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
        },
        {
          accountSeed: "miden-turnkey-123",
          noteTransportUrl: "https://transport.miden.io",
        },
        AccountType.RegularAccountImmutableCode,
        AccountStorageMode.public(),
        signMessage
      );
      setClient(client);
      setAccountId(accountId);
    };
    loadClient();
  }, [embeddedWallets, httpClient]);

  return { client, accountId };
};
```

### Key Integration Points

**1. Creating Miden Client with Turnkey Keystore**

```typescript
// lib/miden-turnkey.ts
const signCb = (turnkeyConfig: TConfig) => {
  return async (pkc: Uint8Array, signingInputs: Uint8Array) => {
    // Deserialize Miden signing inputs
    const deSigningInputs = SigningInputs.deserialize(signingInputs);
    const message = deSigningInputs.toCommitment().toHex();

    // Sign with Turnkey
    const sig = await sign(message, turnkeyConfig);

    // Convert Turnkey signature to Miden format
    const sigBytes = fromTurnkeySig(sig);
    return sigBytes;
  };
};

// Create Miden client with external keystore (Turnkey)
const webClient = await WebClient.createClientWithExternalKeystore(
  endpoint,
  noteTransportUrl,
  seed,
  undefined,
  undefined,
  signCb(turnkeyConfig) // Turnkey signing callback
);
```

**2. Signature Conversion**

Turnkey returns EVM-style signatures that need conversion for Miden:

```typescript
// lib/utils.ts
export const fromTurnkeySig = (sig: { r: string; s: string; v: string }) => {
  const sigBuff = new Uint8Array(67);
  sigBuff[0] = 1; // Signature type

  const rBytes = hexToBytes(sig.r);
  const sBytes = hexToBytes(sig.s);

  sigBuff.set(rBytes, 1); // r value
  sigBuff.set(sBytes, 33); // s value
  sigBuff[65] = parseInt(sig.v); // v value

  return sigBuff;
};
```

**3. Account Creation**

Convert Turnkey's Ethereum public key to Miden account:

```typescript
// lib/miden-turnkey.ts
const compressedPublicKey = signWith.publicKey;
const pkc = await evmPkToCommitment(compressedPublicKey);

const account = accountBuilder
  .withAuthComponent(AccountComponent.createAuthComponentFromCommitment(pkc, 1))
  .accountType(type)
  .storageMode(storageMode)
  .withBasicWalletComponent()
  .build().account;

await midenClient.newAccount(account, false);
```

## Usage

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Environment Variables

```env
NEXT_PUBLIC_TURNKEY_API_URL=https://api.turnkey.com
NEXT_PUBLIC_ORGANIZATION_ID=your_org_id
```

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Use in Components

```typescript
import { useMiden } from "@/hooks/use-miden";
import { useTurnkey } from "@turnkey/react-wallet-kit";

function MyComponent() {
  const { client, accountId } = useMiden();
  const { handleLogin, wallets } = useTurnkey();

  // Create wallet
  await createWallet({
    walletName: "My Wallet",
    accounts: ["ADDRESS_FORMAT_ETHEREUM"],
  });

  // Use Miden client for transactions
  if (client && accountId) {
    await client.syncState();
    const account = await client.getAccount(AccountId.fromHex(accountId));
  }
}
```

## Tech Stack

- **Next.js 15** - React framework
- **Turnkey** - Embedded wallet infrastructure
- **Miden SDK** - Polygon Miden blockchain client
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## License

MIT
