# @miden-sdk/miden-turnkey-react

React hook for integrating Miden with Turnkey wallet authentication.

## Installation

```bash
yarn add @miden-sdk/miden-turnkey-react
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
yarn add @miden-sdk/miden-sdk @miden-sdk/miden-turnkey @turnkey/react-wallet-kit react
```

## Usage

First, wrap your app with Turnkey's `TurnkeyProvider`:

```tsx
import { TurnkeyProvider } from "@turnkey/react-wallet-kit";

function App() {
  return (
    <TurnkeyProvider config={turnkeyConfig}>
      <YourApp />
    </TurnkeyProvider>
  );
}
```

Then use the hook in your components:

```tsx
import { useTurnkeyMiden } from "@miden-sdk/miden-turnkey-react";

function MidenComponent() {
  const { client, accountId, turnkey, embeddedWallets } = useTurnkeyMiden(
    "https://rpc.miden.io", // Node URL
    "public", // Storage mode: "public" or "private"
    {
      accountSeed: "my-unique-seed",
      noteTransportUrl: "https://transport.miden.io",
    }
  );

  if (!client) {
    return <div>Loading Miden client...</div>;
  }

  return (
    <div>
      <p>Account ID: {accountId}</p>
      {/* Use client for Miden operations */}
    </div>
  );
}
```

## API

### `useTurnkeyMiden(nodeUrl, storageMode?, opts?)`

#### Parameters

- `nodeUrl` (string): The Miden node RPC URL
- `storageMode` ("public" | "private", optional): Account storage mode. Defaults to "public"
- `opts` (UseTurnkeyMidenOpts, optional): Additional options
  - `accountSeed`: Seed string for deterministic account generation
  - `noteTransportUrl`: URL for note transport service
  - `endpoint`: Override endpoint (defaults to nodeUrl)
  - `organizationId`: Turnkey organization ID (defaults to session's org ID)

#### Returns

```typescript
interface UseTurnkeyMidenResult {
  client: WebClient | null;
  accountId: string | null;
  turnkey: ClientContextType;
  embeddedWallets: Wallet[];
  nodeUrl: string;
  opts: UseTurnkeyMidenOpts;
}
```

## License

ISC
