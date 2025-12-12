"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface Balance {
  assetId: string;
  balance: string;
}

interface BalanceCardProps {
  balances: Balance[];
  loading?: boolean;
}

export function BalanceCard({ balances, loading = false }: BalanceCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono text-base">
          <TrendingUp className="h-5 w-5 text-primary" />
          BALANCES
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Fungible Asset Holdings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-mono text-sm">
            NO ASSETS FOUND
          </div>
        ) : (
          <div className="space-y-2">
            {balances.map((asset, i) => (
              <div
                key={asset.assetId}
                className="border border-border bg-muted/50 p-4 hover:bg-muted/70 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-mono mb-1">
                      ASSET #{i + 1}
                    </div>
                    <div className="font-mono text-xs text-foreground/70 break-all">
                      {asset.assetId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary font-mono">
                      {asset.balance}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
