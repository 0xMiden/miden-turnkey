# @miden-sdk/create-miden-turnkey-react

CLI to scaffold a React + Vite app with Miden and Turnkey wallet integration.

## Usage

```bash
npm create @miden-sdk/miden-turnkey-react my-app
# or
npx @miden-sdk/create-miden-turnkey-react my-app
# or
yarn create @miden-sdk/miden-turnkey-react my-app
```

### Options

- `--skip-install`: Skip automatic dependency installation

```bash
npm create @miden-sdk/miden-turnkey-react my-app --skip-install
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

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_TURNKEY_ORGANIZATION_ID` | Your Turnkey organization ID |
| `VITE_TURNKEY_API_BASE_URL` | Turnkey API URL (default: https://api.turnkey.com) |
| `VITE_MIDEN_NODE_URL` | Miden node RPC URL (default: https://rpc.miden.io) |
| `VITE_MIDEN_TRANSPORT_URL` | Miden transport URL (default: https://transport.miden.io) |

## License

ISC
