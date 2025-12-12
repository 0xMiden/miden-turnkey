"use client";

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div
      className={`relative border border-border bg-card overflow-hidden ${
        isConnected ? "pulse-glow" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 ${
              isConnected
                ? "bg-primary animate-pulse"
                : "bg-muted-foreground/50"
            }`}
          />
          <span className="font-mono text-sm font-medium">
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
        {isConnected && (
          <span className="text-xs text-muted-foreground font-mono">READY</span>
        )}
      </div>
    </div>
  );
}
