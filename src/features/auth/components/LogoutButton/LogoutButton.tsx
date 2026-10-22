"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon/Icon";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      router.replace("/login?reason=signed_out");
      router.refresh();
    }
  }

  return (
    <Button variant="ghost" fullWidth onClick={logout} disabled={busy}>
      <Icon name="logout" />
      <span data-label>{busy ? "Signing out…" : "Sign out"}</span>
    </Button>
  );
}
