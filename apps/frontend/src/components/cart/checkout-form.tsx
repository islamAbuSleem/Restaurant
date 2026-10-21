"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, MapPin } from "lucide-react";
import { pickupSlotOptions, type ServiceHours } from "@restaurant/shared";
import { useCart } from "@/components/cart/cart-provider";
import { API_URL } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DemoNotice } from "@/components/shared/demo-notice";
import { OrderSummary } from "@/components/cart/order-summary";

type FieldErrors = Record<string, string>;

type CheckoutFormProps = {
  hours: ServiceHours;
  timeZone: string;
  collectionPoint: string;
  serviceHint: string;
};

export function CheckoutForm({ hours, timeZone, collectionPoint, serviceHint }: CheckoutFormProps) {
  const { entries, totalCents, clear, hydrated } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupAt, setPickupAt] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const slots = pickupSlotOptions(new Date(), hours, timeZone);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setErrors({});

    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Tell us who to hand the order to";
    }
    if (!email.includes("@")) {
      nextErrors.email = "Enter a valid email address";
    }
    if (phone.trim().length < 7) {
      nextErrors.phone = "A phone number lets the kitchen reach you";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPending(true);

    try {
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: entries.map((entry) => ({
            menuItemId: entry.menuItemId,
            quantity: entry.quantity,
          })),
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          pickupAt: pickupAt || undefined,
        }),
      });
      const orderPayload: unknown = await orderResponse.json();

      if (!isSuccessPayload(orderPayload)) {
        setError(extractError(orderPayload) ?? "Could not place your order. Please try again.");
        return;
      }

      const orderId = orderPayload.data.id;

      const checkoutResponse = await fetch(`${API_URL}/payments/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const checkoutPayload: unknown = await checkoutResponse.json();

      if (isSuccessPayload(checkoutPayload)) {
        clear();
        window.location.href = checkoutPayload.data.url;
        return;
      }

      if (extractErrorCode(checkoutPayload) === "STRIPE_NOT_CONFIGURED") {
        clear();
        router.push(`/orders/${orderId}?status=pending`);
        return;
      }

      setError(extractError(checkoutPayload) ?? "Could not start checkout. Please try again.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-lg font-medium">Nothing to check out yet</p>
          <p className="text-sm text-muted-foreground">Add a few plates from the menu first.</p>
          <Button asChild className="mt-2">
            <Link href="/menu">Browse the menu</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <DemoNotice />

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-lg">Who is this for?</h2>
            <p className="-mt-2 text-sm text-muted-foreground">
              The kitchen calls this number if anything changes with your order.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name ? (
                  <p id="name-error" className="text-xs text-destructive">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(503) 555-0142"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone ? (
                  <p id="phone-error" className="text-xs text-destructive">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email for your receipt</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : "email-hint"}
              />
              {errors.email ? (
                <p id="email-error" className="text-xs text-destructive">
                  {errors.email}
                </p>
              ) : (
                <p id="email-hint" className="text-xs text-muted-foreground">
                  We email your receipt and nothing else.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-lg">When and where</h2>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pickupAt">Pickup time</Label>
              <Select
                id="pickupAt"
                name="pickupAt"
                value={pickupAt}
                onChange={(event) => setPickupAt(event.target.value)}
              >
                <option value="">As soon as we can (about 20 minutes)</option>
                {slots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                Times are restaurant time. Service runs {serviceHint}.
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                Collection at {collectionPoint}. We&apos;ll call your number when it is plated.
              </p>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Card className="lg:hidden">
          <CardContent className="p-6">
            <h2 className="mb-3 text-lg">Your order</h2>
            <OrderSummary entries={entries} totalCents={totalCents} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Placing your order…" : "Place order"}
        </Button>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Next: we confirm by email, then call you when it is ready.
        </p>
      </form>

      <Card className="hidden lg:sticky lg:top-24 lg:block">
        <CardContent className="p-6">
          <h2 className="mb-3 text-lg">Your order</h2>
          <OrderSummary entries={entries} totalCents={totalCents} />
        </CardContent>
      </Card>
    </div>
  );
}

function isSuccessPayload(value: unknown): value is { success: true; data: { id: string; url: string } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as { success: unknown }).success === true &&
    "data" in value &&
    typeof (value as { data: unknown }).data === "object"
  );
}

function extractError(value: unknown): string | null {
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

function extractErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return null;
  }
  const error = (value as { error: unknown }).error;
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}
