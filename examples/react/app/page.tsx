"use client";

import { useMiden } from "@/hooks/use-miden";
import { AuthState, useTurnkey } from "@turnkey/react-wallet-kit";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { BalanceCard } from "@/components/balance-card";
import { SendModal } from "@/components/send-modal";
import { Wallet, Coins, Eye, Send as SendIcon, Github } from "lucide-react";
import { getBalance } from "@/lib/balance";
import { send } from "@/lib/send";
import { MintAndConsumeProgress, MintAndConsumeStage } from "@/lib/types";

export default function Home() {
  const { authState, handleLogin, wallets, createWallet } = useTurnkey();
  const { client, accountId } = useMiden();

  const [address, setAddress] = useState<string>("");
  const [ethAddress, setEthAddress] = useState<string>("");
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [balances, setBalances] = useState<
    Array<{ assetId: string; balance: string }>
  >([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [mintProgress, setMintProgress] =
    useState<MintAndConsumeProgress | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  const embeddedWallets = wallets.filter(
    (wallet) => wallet.source === "embedded"
  );
  const hasEmbeddedWallet = embeddedWallets.length > 0;
  const isAuthenticated = authState === AuthState.Authenticated;

  useEffect(() => {
    if (client && accountId) {
      const fetchAddress = async () => {
        const { Address, AccountId, NetworkId } = await import(
          "@demox-labs/miden-sdk"
        );
        const addr = Address.fromAccountId(
          AccountId.fromHex(accountId),
          "BasicWallet"
        );
        setAddress(addr.toBech32(NetworkId.Testnet));
      };
      fetchAddress();
    }
  }, [client, accountId]);

  useEffect(() => {
    if (embeddedWallets.length > 0 && embeddedWallets[0].accounts.length > 0) {
      setEthAddress(embeddedWallets[0].accounts[0].address);
    }
  }, [embeddedWallets]);

  useEffect(() => {
    if (mintProgress?.stage === MintAndConsumeStage.ConsumedTokens) {
      setMintProgress(null);
    }
  }, [mintProgress]);

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    try {
      await createWallet({
        walletName: "My Miden Wallet",
        accounts: ["ADDRESS_FORMAT_ETHEREUM"],
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleMintAndConsume = async () => {
    if (!client || !accountId) return;
    const { createFaucetMintAndConsume } = await import("@/lib/mint");
    try {
      await createFaucetMintAndConsume(client, accountId, setMintProgress);
    } catch (error) {
      console.error("Mint error:", error);
      setMintProgress(null);
    }
  };

  const handleViewBalances = async () => {
    if (!client || !accountId) return;
    setLoadingBalances(true);
    try {
      const balanceData = await getBalance(accountId);
      setBalances(balanceData);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setBalances([]);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleSend = async (
    toAddress: string,
    faucetId: string,
    amount: string
  ) => {
    if (!client || !accountId) return;

    return await send(client, accountId, toAddress, faucetId, BigInt(amount));
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 bg-linear-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto p-6 md:p-12 flex-1 w-full">
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="space-y-6">
              <div className="border border-primary/30 bg-card p-8 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-mono mb-2">GET STARTED</h2>
                <p className="text-sm text-muted-foreground mb-6 font-mono">
                  Connect your wallet
                </p>
                <ActionButton
                  onClick={handleLogin}
                  variant="default"
                  icon={<Wallet className="h-5 w-5" />}
                >
                  CONNECT WALLET
                </ActionButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!hasEmbeddedWallet ? (
                <div className="border border-primary/30 bg-card p-8 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-mono mb-2">CREATE WALLET</h2>
                  <p className="text-sm text-muted-foreground mb-6 font-mono">
                    Set up your embedded wallet to start transacting
                  </p>
                  <ActionButton
                    onClick={handleCreateWallet}
                    loading={creatingWallet}
                    variant="default"
                    icon={<Wallet className="h-5 w-5" />}
                  >
                    CREATE WALLET
                  </ActionButton>
                </div>
              ) : (
                <>
                  {ethAddress && (
                    <div className="border border-primary/20 bg-card/50 p-5">
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                        Ethereum Address
                      </span>
                      <p className="font-mono text-sm text-primary break-all mt-2">
                        {ethAddress}
                      </p>
                    </div>
                  )}

                  {address && (
                    <div className="border border-primary/20 bg-card/50 p-5">
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                        Miden Address
                      </span>
                      <p className="font-mono text-sm text-primary break-all mt-2">
                        {address}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionButton
                      onClick={handleMintAndConsume}
                      disabled={!client || !accountId || !!mintProgress}
                      loading={!!mintProgress}
                      variant="secondary"
                      icon={<Coins className="h-5 w-5" />}
                    >
                      {mintProgress
                        ? String(mintProgress.stage)
                            .replace(/([A-Z])/g, " $1")
                            .trim()
                            .toUpperCase()
                        : "MINT & CONSUME"}
                    </ActionButton>

                    <ActionButton
                      onClick={handleViewBalances}
                      disabled={!client || !accountId}
                      loading={loadingBalances}
                      variant="secondary"
                      icon={<Eye className="h-5 w-5" />}
                    >
                      VIEW BALANCES
                    </ActionButton>

                    <ActionButton
                      onClick={() => setShowSendModal(true)}
                      disabled={!client || !accountId}
                      variant="default"
                      icon={<SendIcon className="h-5 w-5" />}
                    >
                      SEND
                    </ActionButton>
                  </div>

                  {balances.length > 0 && (
                    <BalanceCard
                      balances={balances}
                      loading={loadingBalances}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="relative border-t border-primary/20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
              <span className="text-lg font-bold font-mono tracking-tight">
                MIDEN × TURNKEY
              </span>
              <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            </div>
            <a
              href="https://github.com/0xnullifier/miden-turnkey-example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-card/50 hover:bg-primary/10 transition-colors font-mono text-xs"
            >
              <Github className="h-3.5 w-3.5" />
              VIEW SOURCE
            </a>
          </div>
        </div>
      </footer>

      {showSendModal && (
        <SendModal
          onSend={handleSend}
          onClose={() => setShowSendModal(false)}
          accountId={accountId!}
        />
      )}
    </main>
  );
}
