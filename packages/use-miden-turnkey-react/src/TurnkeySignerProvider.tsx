import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { TurnkeyBrowserClient } from "@turnkey/sdk-browser";
import type { WalletAccount } from "@turnkey/core";
import { SignerContext, type SignerContextValue } from "./signer-types";
import { evmPkToCommitment, fromTurnkeySig } from "@miden-sdk/miden-turnkey";
import type { Turnkey, TConfig } from "@miden-sdk/miden-turnkey";
import { isHttpClient } from "@turnkey/http";

// TURNKEY SIGNER PROVIDER
// ================================================================================================

export interface TurnkeySignerProviderProps {
  children: ReactNode;
  /** Turnkey client instance (TurnkeyBrowserClient or TurnkeyClient) */
  client: Turnkey;
  /** Turnkey organization ID */
  organizationId: string;
}

/**
 * Turnkey-specific extras exposed via useTurnkeySigner hook.
 */
export interface TurnkeySignerExtras {
  /** Turnkey client instance */
  client: Turnkey;
  /** Turnkey organization ID */
  organizationId: string;
  /** Connected account (null if not connected) */
  account: WalletAccount | null;
}

const TurnkeySignerExtrasContext = createContext<TurnkeySignerExtras | null>(
  null
);

/**
 * Signs a message using Turnkey's signRawPayload API.
 */
async function signWithTurnkey(
  messageHex: string,
  config: TConfig
): Promise<{ r: string; s: string; v: string }> {
  const { client, organizationId, account } = config;

  if (isHttpClient(client)) {
    const { activity } = await client.signRawPayload({
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      organizationId: organizationId,
      timestampMs: String(Date.now()),
      parameters: {
        signWith: account.address,
        payload: messageHex,
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_KECCAK256",
      },
    });

    if (activity.status !== "ACTIVITY_STATUS_COMPLETED") {
      throw new Error(`Invalid activity status: ${activity.status}`);
    }

    const result = activity?.result?.signRawPayloadResult;
    if (!result) {
      throw new Error("No signature result from Turnkey");
    }
    return result;
  } else {
    const result = await (client as TurnkeyBrowserClient).signRawPayload({
      signWith: account.address,
      payload: messageHex,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: "HASH_FUNCTION_KECCAK256",
    });
    return result;
  }
}

/**
 * TurnkeySignerProvider wraps MidenProvider to enable Turnkey wallet signing.
 *
 * @example
 * ```tsx
 * const turnkeyClient = new TurnkeyBrowserClient({ ... });
 *
 * <TurnkeySignerProvider client={turnkeyClient} organizationId="your-org-id">
 *   <MidenProvider config={{ rpcUrl: "testnet" }}>
 *     <App />
 *   </MidenProvider>
 * </TurnkeySignerProvider>
 * ```
 */
export function TurnkeySignerProvider({
  children,
  client,
  organizationId,
}: TurnkeySignerProviderProps) {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect/disconnect methods (stable references)
  const connect = useCallback(async () => {
    // For Turnkey, connection typically happens through passkey/email auth
    // The app should call this after the user authenticates
    // For now, we need the account to be set externally or through a login flow
    // This is a placeholder - apps should use useTurnkeySigner().setAccount()
    console.warn(
      "TurnkeySignerProvider.connect() called - please set account via useTurnkeySigner().setAccount()"
    );
  }, []);

  const disconnect = useCallback(async () => {
    setAccount(null);
    setIsConnected(false);
  }, []);

  // Allow external setting of account (for apps that handle auth themselves)
  const setConnectedAccount = useCallback((acc: WalletAccount | null) => {
    setAccount(acc);
    setIsConnected(acc !== null);
  }, []);

  // Build signer context
  const [signerContext, setSignerContext] = useState<SignerContextValue | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function buildContext() {
      if (!isConnected || !account) {
        // Not connected - provide context with connect/disconnect but no signing capability
        setSignerContext({
          signCb: async () => {
            throw new Error("Turnkey wallet not connected");
          },
          accountConfig: null as any,
          storeName: "",
          name: "Turnkey",
          isConnected: false,
          connect,
          disconnect,
        });
        return;
      }

      try {
        // Connected - build full context with signing capability
        const compressedPublicKey = account.publicKey;
        if (!compressedPublicKey) {
          throw new Error("Account has no public key");
        }

        const commitment = await evmPkToCommitment(compressedPublicKey);
        const commitmentBytes = commitment.serialize();

        const signCb = async (_: Uint8Array, signingInputs: Uint8Array) => {
          const { SigningInputs } = await import("@demox-labs/miden-sdk");
          const inputs = SigningInputs.deserialize(signingInputs);
          const messageHex = inputs.toCommitment().toHex();

          const sig = await signWithTurnkey(messageHex, {
            client,
            organizationId,
            account,
          });
          return fromTurnkeySig(sig);
        };

        if (!cancelled) {
          const { AccountStorageMode } = await import("@demox-labs/miden-sdk");

          setSignerContext({
            signCb,
            accountConfig: {
              publicKeyCommitment: commitmentBytes,
              accountType: "RegularAccountImmutableCode",
              storageMode: AccountStorageMode.public(),
            },
            storeName: `turnkey_${account.address}`,
            name: "Turnkey",
            isConnected: true,
            connect,
            disconnect,
          });
        }
      } catch (error) {
        console.error("Failed to build Turnkey signer context:", error);
        if (!cancelled) {
          setSignerContext({
            signCb: async () => {
              throw new Error("Turnkey wallet not connected");
            },
            accountConfig: null as any,
            storeName: "",
            name: "Turnkey",
            isConnected: false,
            connect,
            disconnect,
          });
        }
      }
    }

    buildContext();
    return () => {
      cancelled = true;
    };
  }, [isConnected, account, client, organizationId, connect, disconnect]);

  // Extended extras context with setAccount
  const extrasValue = useMemo(
    () => ({
      client,
      organizationId,
      account,
      setAccount: setConnectedAccount,
    }),
    [client, organizationId, account, setConnectedAccount]
  );

  return (
    <TurnkeySignerExtrasContext.Provider value={extrasValue}>
      <SignerContext.Provider value={signerContext}>
        {children}
      </SignerContext.Provider>
    </TurnkeySignerExtrasContext.Provider>
  );
}

/**
 * Hook for Turnkey-specific extras beyond the unified useSigner interface.
 * Use this to access the Turnkey client, organization, or set the account.
 *
 * @example
 * ```tsx
 * const { client, organizationId, account, setAccount, isConnected } = useTurnkeySigner();
 *
 * // After Turnkey auth flow completes:
 * setAccount(walletAccount);
 * ```
 */
export function useTurnkeySigner(): TurnkeySignerExtras & {
  isConnected: boolean;
  setAccount: (account: WalletAccount | null) => void;
} {
  const extras = useContext(TurnkeySignerExtrasContext) as TurnkeySignerExtras & {
    setAccount: (account: WalletAccount | null) => void;
  } | null;
  const signer = useContext(SignerContext);
  if (!extras) {
    throw new Error("useTurnkeySigner must be used within TurnkeySignerProvider");
  }
  return { ...extras, isConnected: signer?.isConnected ?? false };
}
