"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  variant = "secondary",
  children,
  icon,
  fullWidth = true,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      className={`${
        fullWidth ? "w-full" : ""
      } h-12 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
        variant === "default"
          ? "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35"
          : ""
      }`}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      <span className="font-mono text-sm tracking-wide">{children}</span>
    </Button>
  );
}
