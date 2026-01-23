# @miden-sdk/miden-turnkey

Miden + Turnkey wallet integration SDK for building secure blockchain applications.

## Packages

This monorepo contains the following packages:

| Package | Description |
|---------|-------------|
| [`@miden-sdk/miden-turnkey`](/) | Core SDK for Miden + Turnkey integration |
| [`@miden-sdk/miden-turnkey-react`](/packages/use-miden-turnkey-react) | React hook for easy integration |
| [`@miden-sdk/create-miden-turnkey-react`](/packages/create-miden-turnkey-react) | CLI to scaffold new projects |

## Quick Start

### Option 1: Scaffold a new project

```bash
npm create @miden-sdk/miden-turnkey-react my-app
cd my-app
npm run dev
```

### Option 2: Add to an existing React project

```bash
npm install @miden-sdk/miden-turnkey @miden-sdk/miden-turnkey-react @demox-labs/miden-sdk @turnkey/react-wallet-kit
```

```tsx
import { TurnkeyProvider } from "@turnkey/react-wallet-kit";
import { useTurnkeyMiden } from "@miden-sdk/miden-turnkey-react";

function App() {
  return (
    <TurnkeyProvider config={turnkeyConfig}>
      <MidenApp />
    </TurnkeyProvider>
  );
}

function MidenApp() {
  const { client, accountId } = useTurnkeyMiden(
    "https://rpc.miden.io",
    "public",
    { accountSeed: "my-seed" }
  );

  if (!client) return <div>Loading...</div>;

  return <div>Account: {accountId}</div>;
}
```

### Option 3: Use the core SDK directly

```bash
npm install @miden-sdk/miden-turnkey @demox-labs/miden-sdk @turnkey/http
```

```typescript
import { createMidenTurnkeyClient } from "@miden-sdk/miden-turnkey";
import { TurnkeyClient } from "@turnkey/http";

const turnkeyClient = new TurnkeyClient({
  baseUrl: "https://api.turnkey.com",
  // ... auth config
});

const { client, accountId } = await createMidenTurnkeyClient(
  {
    client: turnkeyClient,
    organizationId: "your-org-id",
    account: walletAccount,
  },
  {
    endpoint: "https://rpc.miden.io",
    noteTransportUrl: "https://transport.miden.io",
    accountSeed: "my-seed",
    type: AccountType.RegularAccountImmutableCode,
    storageMode: AccountStorageMode.public(),
  }
);
```

## Installation

### Core SDK

```bash
npm install @miden-sdk/miden-turnkey
```

**Peer Dependencies:**
- `@demox-labs/miden-sdk@^0.12.5`
- `@turnkey/core@^1.8.2`
- `@turnkey/http@^3.15.0`
- `@turnkey/sdk-browser@^5.13.4`

### React Hook

```bash
npm install @miden-sdk/miden-turnkey-react
```

**Peer Dependencies:**
- `@miden-sdk/miden-turnkey@^1.0.0`
- `@demox-labs/miden-sdk@^0.12.5`
- `@turnkey/react-wallet-kit@^1.6.2`
- `react@^18.0.0 || ^19.0.0`

## Development

### Prerequisites

- Node.js 18+
- Yarn 1.22.22

### Setup

```bash
# Clone the repository
git clone https://github.com/0xPolygonMiden/miden-turnkey.git
cd miden-turnkey

# Install dependencies
yarn install

# Build all packages
yarn build
```

### Building Individual Packages

```bash
# Root package
yarn build

# React hook package
cd packages/use-miden-turnkey-react
yarn install
yarn build
```

### Running the Example

```bash
cd examples/react
yarn install
yarn dev
```

## API Reference

### `createMidenTurnkeyClient(turnkeyConfig, opts)`

Creates a Miden client with Turnkey signing integration.

#### Parameters

- `turnkeyConfig` - Turnkey configuration
  - `client` - TurnkeyClient or TurnkeyBrowserClient instance
  - `organizationId` - Your Turnkey organization ID
  - `account` - WalletAccount to use for signing
- `opts` - Miden options
  - `endpoint` - Miden node RPC URL
  - `noteTransportUrl` - Note transport service URL
  - `seed` - Client seed
  - `accountSeed` - Account derivation seed
  - `type` - Account type (RegularAccountImmutableCode, etc.)
  - `storageMode` - Storage mode (public or private)

#### Returns

```typescript
{
  client: WebClient;
  accountId: string;
}
```

### `useTurnkeyMiden(nodeUrl, storageMode?, opts?)`

React hook for Miden + Turnkey integration. See [@miden-sdk/miden-turnkey-react README](/packages/use-miden-turnkey-react/README.md).

## Examples

See the [examples/react](/examples/react) directory for a complete Next.js example application.

## License

ISC
