"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface WalletCardProps {
  walletName: string;
  walletId: string;
  accounts: Array<{ address: string; addressFormat: string }>;
}

export function WalletCard({
  walletName,
  walletId,
  accounts,
}: WalletCardProps) {
  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {walletName}
            </CardTitle>
            <CardDescription className="font-mono text-xs break-all mt-2 text-muted-foreground/70">
              ID: {walletId.slice(0, 16)}...{walletId.slice(-8)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {accounts.map((account, i) => (
          <div
            key={account.address}
            className="border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="text-xs text-primary font-mono mb-1.5">
              {account.addressFormat}
            </div>
            <div className="font-mono text-xs text-foreground/80 break-all">
              {account.address}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
