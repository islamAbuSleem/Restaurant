import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  href?: string;
};

export function StatCard({ label, value, detail, href }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-display text-3xl">{value}</span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{detail}</span>
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
