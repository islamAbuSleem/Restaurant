import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { sanitizeNextPath } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-balance text-4xl leading-tight">Welcome back.</h1>
        <p className="max-w-md text-muted-foreground">
          Sign in to check your orders and keep your details for next time. Working the pass? You
          land straight on the service board.
        </p>
      </div>
      <div className="w-full max-w-md lg:justify-self-end">
        <AuthForm mode="login" nextPath={nextPath} />
      </div>
    </div>
  );
}
