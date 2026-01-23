import { TurnkeyProvider } from "@turnkey/react-wallet-kit";
import { useTurnkeyMiden } from "@miden-sdk/miden-turnkey-react";
import "@turnkey/react-wallet-kit/styles.css";

const turnkeyConfig = {
  apiBaseUrl: import.meta.env.VITE_TURNKEY_API_BASE_URL || "https://api.turnkey.com",
  defaultOrganizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID || "",
  authConfig: {
    emailEnabled: true,
    passkeyEnabled: true,
  },
  wallet: {
    embedded: {
      createOnLogin: true,
    },
  },
};

function MidenDemo() {
  const { client, accountId, turnkey, embeddedWallets } = useTurnkeyMiden(
    import.meta.env.VITE_MIDEN_NODE_URL || "https://rpc.miden.io",
    "public",
    {
      accountSeed: "miden-turnkey-demo",
      noteTransportUrl: import.meta.env.VITE_MIDEN_TRANSPORT_URL || "https://transport.miden.io",
    }
  );

  const { user, handleLogin } = turnkey;

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
        <p><strong>Email:</strong> {user.email || "N/A"}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Wallets</h2>
        {embeddedWallets.length > 0 ? (
          <ul>
            {embeddedWallets.map((wallet) => (
              <li key={wallet.walletId}>
                {wallet.walletName || wallet.walletId}
              </li>
            ))}
          </ul>
        ) : (
          <p>No wallets found</p>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Miden Client</h2>
        {client ? (
          <div>
            <p style={{ color: "green" }}>Client initialized</p>
            <p><strong>Account ID:</strong> {accountId}</p>
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
