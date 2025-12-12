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
  signWith: WalletAccount;
};

export interface MidenClientOpts {
  endpoint?: string;
  noteTransportUrl?: string;
  seed?: string;
  accountSeed?: string;
}

export enum MintAndConsumeStage {
  CreatingFaucet = "CreatingFaucet",
  CreatedFaucet = "CreatedFaucet",
  MintingTokens = "MintingTokens",
  MintedTokens = "MintedTokens",
  ConsumingTokens = "ConsumingTokens",
  ConsumedTokens = "ConsumedTokens",
}

export interface MintAndConsumeProgress {
  stage: MintAndConsumeStage;
  faucetId?: string;
  mintTxHash?: string;
  consumeTxHash?: string;
}
