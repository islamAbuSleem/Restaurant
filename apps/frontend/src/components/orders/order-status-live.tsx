"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 20000;

type OrderStatusLiveProps = {
  status: string;
};

export function OrderStatusLive({ status }: OrderStatusLiveProps) {
  const router = useRouter();
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const settled = status === "completed" || status === "cancelled";

  useEffect(() => {
    if (settled) {
      return;
    }
    setCheckedAt(new Date());
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }
      router.refresh();
      setCheckedAt(new Date());
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [router, settled]);

  if (settled) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <span aria-live="polite">
        {checkedAt ? `Checked ${formatClock(checkedAt)}` : "Checking the pass…"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-xs"
        onClick={() => {
          router.refresh();
          setCheckedAt(new Date());
        }}
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Refresh
      </Button>
    </div>
  );
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}
