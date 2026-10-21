"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  className?: string;
  showLabel?: boolean;
};

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
  showLabel = true,
}: SignOutButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleSignOut(): Promise<void> {
    setPending(true);
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // The session may already be gone; the redirect below still refreshes the shell.
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => void handleSignOut()}
      disabled={pending}
      className={className}
      aria-label={showLabel ? undefined : "Sign out"}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {showLabel ? <span>{pending ? "Signing out…" : "Sign out"}</span> : null}
    </Button>
  );
}
