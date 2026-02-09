import { TurnkeySDKClientBase, WalletAccount } from "@turnkey/core";
import type { TurnkeyBrowserClient } from "@turnkey/sdk-browser";
import type { TurnkeyClient } from "@turnkey/http";
export type Turnkey =
  | TurnkeyClient
  | TurnkeyBrowserClient
  | TurnkeySDKClientBase;

export type TConfig = {
  /**
   * Turnkey client
   */
  client: Turnkey;
  /**
   * Turnkey organization ID
   */
  organizationId: string;
  /**
   * Turnkey wallet account public key or private key ID
   */
  account: WalletAccount;
};

export interface MidenClientOpts {
  endpoint?: string;
  noteTransportUrl?: string;
  seed?: string;
  accountSeed?: string;
}

export interface MidenAccountOpts {
  type: import("@miden-sdk/miden-sdk").AccountType;
  storageMode: import("@miden-sdk/miden-sdk").AccountStorageMode;
}
