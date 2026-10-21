"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

let attempted = false;

/**
 * Revives an expired session: the API rotates the access token from the
 * refresh cookie, then the shell re-renders with the signed-in state.
 */
export function SessionRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (attempted) {
      return;
    }
    attempted = true;

    void fetch("/api/session/refresh", { method: "POST" })
      .then((response) => {
        if (response.ok) {
          router.refresh();
        }
      })
      .catch(() => undefined);
  }, [router]);

  return null;
}
