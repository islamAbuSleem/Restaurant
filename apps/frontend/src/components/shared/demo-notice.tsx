import { Info } from "lucide-react";

export function DemoNotice() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <p>
        Demo build: online payment is off until Stripe keys are configured, so your order is placed
        straight on the pass and no card is charged.
      </p>
    </div>
  );
}
