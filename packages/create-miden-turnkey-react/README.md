# @miden-sdk/create-miden-turnkey-react

CLI to scaffold a React + Vite app with Miden and Turnkey wallet integration.

## Usage

```bash
yarn create @miden-sdk/miden-turnkey-react my-app
```

### Options

- `--skip-install`: Skip automatic dependency installation

```bash
yarn create @miden-sdk/miden-turnkey-react my-app --skip-install
```

## What's Included

The generated project includes:

- **Vite** - Fast build tool with HMR
- **React 18/19** - UI library
- **TypeScript** - Type safety
- **@demox-labs/miden-sdk** - Miden blockchain SDK
- **@turnkey/react-wallet-kit** - Turnkey wallet integration
- **@miden-sdk/miden-turnkey** - Miden + Turnkey integration layer
- **@miden-sdk/miden-turnkey-react** - React hook for Miden + Turnkey

### Pre-configured Features

- WASM support for Miden SDK
- Buffer/process polyfills for browser
- TurnkeyProvider setup
- Basic authentication flow
- Miden client initialization

## Getting Started

After creating your project:

1. Navigate to your project:
   ```bash
   cd my-app
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your Turnkey credentials:
   ```
   VITE_TURNKEY_ORGANIZATION_ID=your-organization-id
   ```

4. (Optional) Customize Miden settings in `src/App.tsx`:
   ```typescript
   const midenConfig = {
     nodeUrl: "https://rpc.miden.io",
     transportUrl: "https://transport.miden.io",
     accountSeed: "my-unique-seed",
     storageMode: "public" as const,
   };
   ```

5. Start the development server:
   ```bash
   yarn dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_TURNKEY_ORGANIZATION_ID` | Your Turnkey organization ID |
| `VITE_TURNKEY_API_BASE_URL` | Turnkey API URL (default: https://api.turnkey.com) |

## Miden Configuration

Miden settings are configured directly in `src/App.tsx` for flexibility:

| Setting | Default | Description |
|---------|---------|-------------|
| `nodeUrl` | `https://rpc.miden.io` | Miden node RPC URL |
| `transportUrl` | `https://transport.miden.io` | Note transport service URL |
| `accountSeed` | `miden-turnkey-demo` | Seed for deterministic account generation |
| `storageMode` | `public` | Account storage mode (`public` or `private`) |

## License

ISC
