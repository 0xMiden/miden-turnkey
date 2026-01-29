"use client";

import { useTurnkeyMiden } from "@miden-sdk/miden-turnkey-react";

export const useMiden = () => {
  const { client, accountId } = useTurnkeyMiden(
    "https://rpc.testnet.miden.io",
    "public",
    {
      accountSeed: "miden-turnkey-123",
      noteTransportUrl: "https://transport.miden.io",
      organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
    },
  );

  return { client, accountId };
};
