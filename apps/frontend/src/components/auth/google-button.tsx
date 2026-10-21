"use client";

import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

export function GoogleButton() {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      disabled={!googleEnabled}
      title={googleEnabled ? undefined : "Google sign-in is not configured"}
      onClick={() => {
        window.location.href = `${API_URL}/auth/google`;
      }}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.4-1.64 4.12-5.27 4.12-3.17 0-5.75-2.62-5.75-5.85s2.58-5.85 5.75-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.83 3.94 14.68 3 12.17 3 6.98 3 2.79 7.19 2.79 12.38s4.19 9.38 9.38 9.38c5.41 0 9-3.8 9-9.16 0-.62-.07-1.09-.15-1.5Z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
