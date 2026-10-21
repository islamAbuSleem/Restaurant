import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-balance text-4xl leading-tight">Keep your orders in one place.</h1>
        <p className="max-w-md text-muted-foreground">
          An account ties every order to your name and number, so checkout takes seconds and you
          can follow each ticket from the pass.
        </p>
      </div>
      <div className="w-full max-w-md lg:justify-self-end">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
