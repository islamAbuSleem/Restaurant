import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="font-display text-5xl">Cold hearth</p>
      <h1 className="text-balance text-3xl leading-tight">We could not find that page.</h1>
      <p className="max-w-md text-muted-foreground">
        The link may be old, or the dish may have left the menu. The kitchen is still open.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/menu">See tonight&apos;s menu</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to the front</Link>
        </Button>
      </div>
    </div>
  );
}
