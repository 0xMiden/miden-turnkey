import {
  TurnkeyProvider,
  type TurnkeyProviderConfig,
} from "@turnkey/react-wallet-kit";
import { useTurnkeyMiden } from "@miden-sdk/miden-turnkey-react";
import "@turnkey/react-wallet-kit/styles.css";

// Miden configuration - customize these values for your app
const midenConfig = {
  nodeUrl: "https://rpc.testnet.miden.io",
  transportUrl: "https://transport.miden.io",
  accountSeed: "miden-turnkey-demo",
  storageMode: "public" as const,
};

// Turnkey configuration
const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID!,
  authProxyConfigId: import.meta.env.VITE_AUTH_PROXY_CONFIG_ID!,
};

function MidenDemo() {
  const { client, accountId, turnkey, embeddedWallets } = useTurnkeyMiden(
    midenConfig.nodeUrl,
    midenConfig.storageMode,
    {
      accountSeed: midenConfig.accountSeed,
      noteTransportUrl: midenConfig.transportUrl,
    },
  );

  const { user, handleLogin, createWallet } = turnkey;

  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Miden + Turnkey Demo</h1>
        <p>Sign in to get started</p>
        <button
          onClick={() => handleLogin()}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            cursor: "pointer",
            backgroundColor: "#646cff",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Miden + Turnkey Demo</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>User Info</h2>
        <p>
          <strong>Email:</strong> {user.userEmail || "N/A"}
        </p>
        <p>
          <strong>User ID:</strong> {user.userId}
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Wallets</h2>
        {embeddedWallets.length > 0 ? (
          <ul>
            {embeddedWallets.map((wallet) => (
              <li key={wallet.walletId}>
                {wallet.walletName || wallet.walletId}{" "}
                {wallet.accounts[0].address}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p>No wallets found</p>
            <button
              onClick={async () => {
                await createWallet({
                  walletName: "My Miden Wallet",
                  accounts: ["ADDRESS_FORMAT_ETHEREUM"],
                });
              }}
            >
              {" "}
              Create Wallet
            </button>
          </>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Miden Client</h2>
        {client ? (
          <div>
            <p style={{ color: "green" }}>Client initialized</p>
            <p>
              <strong>Account ID:</strong> {accountId}
            </p>
          </div>
        ) : (
          <p>Loading Miden client...</p>
        )}
      </section>
    </div>
  );
}

function App() {
  return (
    <TurnkeyProvider config={turnkeyConfig}>
      <MidenDemo />
    </TurnkeyProvider>
  );
}

export default App;
