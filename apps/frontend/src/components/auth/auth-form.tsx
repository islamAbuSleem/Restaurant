"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role } from "@restaurant/shared";
import { API_URL } from "@/lib/api";
import { isDashboardPath } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";

type AuthFormProps = {
  mode: "login" | "register";
  nextPath?: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const body = isLogin
      ? {
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        }
      : {
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        };

    try {
      const response = await fetch(`${API_URL}/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError(readError(payload) ?? "Could not sign you in. Please try again.");
        return;
      }

      router.push(resolveTarget(nextPath, readRole(payload)));
      router.refresh();
    } catch {
      setError("Network error. Check that the API is running and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {!isLogin ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" placeholder="Your name" required />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Your password" : "At least 8 characters"}
              minLength={isLogin ? undefined : 8}
              required
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Signing in…" : isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <GoogleButton />

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

function readError(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return null;
  }
  const error = (value as { error: unknown }).error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === "string" ? message : null;
  }
  return null;
}

function readRole(value: unknown): Role | null {
  if (typeof value !== "object" || value === null || !("data" in value)) {
    return null;
  }
  const data = (value as { data: unknown }).data;
  if (typeof data !== "object" || data === null || !("user" in data)) {
    return null;
  }
  const user = (data as { user: unknown }).user;
  if (typeof user !== "object" || user === null || !("role" in user)) {
    return null;
  }
  const role = (user as { role: unknown }).role;
  return role === "customer" || role === "staff" || role === "admin" ? role : null;
}

function resolveTarget(nextPath: string | undefined, role: Role | null): string {
  const staff = role === "staff" || role === "admin";
  if (nextPath) {
    if (isDashboardPath(nextPath) && !staff) {
      return "/";
    }
    return nextPath;
  }
  return staff ? "/dashboard" : "/";
}
