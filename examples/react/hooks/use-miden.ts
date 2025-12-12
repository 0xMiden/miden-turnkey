"use client";

import { createMidenTurnkeyClient } from "@/lib/miden-turnkey";
import { HandleSignMessageParams, useTurnkey } from "@turnkey/react-wallet-kit";
import { useEffect, useMemo, useState } from "react";

export const useMiden = () => {
  const [client, setClient] = useState<
    import("@demox-labs/miden-sdk").WebClient | null
  >(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  const { wallets, httpClient, handleSignMessage } = useTurnkey();
  const embeddedWallets = useMemo(
    () => wallets.filter((wallet) => wallet.source === "embedded"),
    [wallets]
  );
  const signMessage = useMemo(
    () => (params: Omit<HandleSignMessageParams, "walletAccount">) =>
      handleSignMessage({
        ...params,
        walletAccount: embeddedWallets[0].accounts[0],
      }),
    [embeddedWallets, handleSignMessage]
  );
  useEffect(() => {
    if (embeddedWallets.length === 0) {
      setClient(null);
      return;
    }
    if (!httpClient) {
      console.warn("HTTP client is not available");
      return;
    }
    const loadClient = async () => {
      const { AccountType, AccountStorageMode } = await import(
        "@demox-labs/miden-sdk"
      );
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
    return () => {
      client?.terminate();
      setClient(null);
    };
  }, [embeddedWallets, httpClient]);

  return { client, accountId };
};
