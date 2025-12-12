import type React from "react";
import { type MintAndConsumeProgress, MintAndConsumeStage } from "./types";
import { toast } from "sonner";

export async function createFaucetMintAndConsume(
  // client from useMiden hook
  client: import("@demox-labs/miden-sdk").WebClient,
  accountId: string,
  setProgress: React.Dispatch<
    React.SetStateAction<MintAndConsumeProgress | null>
  >
) {
  const { WebClient, AccountStorageMode, NoteType, AccountId } = await import(
    "@demox-labs/miden-sdk"
  );
  setProgress({ stage: MintAndConsumeStage.CreatingFaucet });
  const newClient = await WebClient.createClient(); // default endpoint is tesnet
  await newClient.syncState();
  const faucet = await newClient.newFaucet(
    AccountStorageMode.public(),
    false,
    "MID",
    8,
    BigInt(1_000_000_0000_00),
    1
  );
  console.log("Created faucet with ID:", faucet.id().toString());
  setProgress((state) => ({
    ...state,
    stage: MintAndConsumeStage.CreatedFaucet,
    faucetId: faucet.id().toString(),
  }));
  await client.syncState();
  const to = await client.getAccount(AccountId.fromHex(accountId));
  if (!to) {
    throw new Error("Account not found");
  }
  setProgress((state) => ({
    ...state,
    stage: MintAndConsumeStage.MintingTokens,
  }));
  const mintTxRequest = newClient.newMintTransactionRequest(
    to.id(),
    faucet.id(),
    NoteType.Public,
    BigInt(1000) * BigInt(1e8)
  );
  const txHash = await newClient.submitNewTransaction(
    faucet.id(),
    mintTxRequest
  );
  console.log("Mint Tx Hash:", txHash.toString());
  setProgress((state) => ({
    ...state,
    stage: MintAndConsumeStage.MintedTokens,
    mintTxHash: txHash.toHex(),
  }));
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log("Proceeding to consume tokens...");
  setProgress((state) => ({
    ...state,
    stage: MintAndConsumeStage.ConsumingTokens,
  }));
  await client.syncState();
  const mintedNotes = await client.getConsumableNotes(to.id());
  const mintedNoteIds = mintedNotes.map((n) =>
    n.inputNoteRecord().id().toString()
  );
  const consumeTxRequest = client.newConsumeTransactionRequest(mintedNoteIds);
  const consumeTxHash = await client.submitNewTransaction(
    to.id(),
    consumeTxRequest
  );
  await client.syncState();
  console.log("Consume Tx Hash:", consumeTxHash.toHex());
  setProgress((state) => ({
    ...state,
    stage: MintAndConsumeStage.ConsumedTokens,
    consumeTxHash: consumeTxHash.toHex(),
  }));
  toast.success("Transaction Completed", {
    description: `Successfully minted and consumed tokens. Faucet ID: ${faucet
      .id()
      .toString()}`,
    action: {
      label: "View TX",
      onClick: () => {
        window.open(
          `https://testnet.midenscan.com/tx/${consumeTxHash.toHex()}`,
          "_blank"
        );
      },
    },
  });
}
