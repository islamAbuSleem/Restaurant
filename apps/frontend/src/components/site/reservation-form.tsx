"use client";

import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import {
  createReservationSchema,
  isWithinServiceWindow,
  serviceDays,
  serviceHoursRows,
  serviceTimes,
  serviceWindowMessage,
  type RestaurantProfile,
} from "@restaurant/shared";
import { API_URL } from "@/lib/api";
import { formatRestaurantDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type FieldErrors = Record<string, string>;

type Confirmation = {
  name: string;
  email: string;
  partySize: number;
  reservedFor: string;
};

/** The kitchen needs a moment to plate before it can take a seat. */
const LEAD_TIME_MS = 45 * 60 * 1000;

export function ReservationForm({ restaurant }: { restaurant: RestaurantProfile }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const serviceRows = serviceHoursRows(restaurant.hours, restaurant.timezone);
  const serviceHint = serviceRows.map((row) => `${row.day} ${row.time}`).join(", ");

  // Only days the kitchen is actually open, and only times still ahead of us.
  const { days, timesByDay } = useMemo(() => {
    const earliest = Date.now() + LEAD_TIME_MS;
    const openDays = serviceDays(restaurant.hours, restaurant.timezone);
    const timesByDay = new Map<string, ReturnType<typeof serviceTimes>>();

    for (const day of openDays) {
      const times = serviceTimes(restaurant.hours, restaurant.timezone, day).filter(
        (time) => new Date(time.instant).getTime() >= earliest,
      );
      if (times.length > 0) {
        timesByDay.set(day.key, times);
      }
    }

    return {
      days: openDays.filter((day) => (timesByDay.get(day.key)?.length ?? 0) > 0),
      timesByDay,
    };
  }, [restaurant.hours, restaurant.timezone]);

  const [dayKey, setDayKey] = useState(() => days[0]?.key ?? "");
  const [timeKey, setTimeKey] = useState(() => timesByDay.get(days[0]?.key ?? "")?.[0]?.key ?? "");

  const times = timesByDay.get(dayKey) ?? [];
  const selectedInstant = times.find((time) => time.key === timeKey)?.instant ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    // Capture the form before awaiting: `event.currentTarget` is cleared once the
    // handler yields, and resetting it later threw a false "network error".
    const form = event.currentTarget;

    setErrors({});
    setMessage(null);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      partySize: Number(formData.get("partySize") ?? 2),
      reservedFor: selectedInstant,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    };

    if (!selectedInstant) {
      setErrors({ reservedTime: "Choose a time we are open for." });
      return;
    }

    const parsed = createReservationSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    const reservedFor = new Date(parsed.data.reservedFor);
    if (!isWithinServiceWindow(reservedFor, restaurant.hours, restaurant.timezone)) {
      setErrors({
        reservedTime: serviceWindowMessage(reservedFor, restaurant.hours, restaurant.timezone),
      });
      return;
    }
    if (parsed.data.partySize > restaurant.maxPartySize) {
      setErrors({
        partySize: `For parties over ${restaurant.maxPartySize}, call ${restaurant.phone}.`,
      });
      return;
    }

    setStatus("pending");
    setConfirmation({
      name: parsed.data.name,
      email: parsed.data.email,
      partySize: parsed.data.partySize,
      reservedFor: parsed.data.reservedFor,
    });

    let created = false;
    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(readError(body) ?? "We couldn't save your reservation. Please try again.");
        return;
      }

      created = true;
      setStatus("success");
      setMessage("We'll confirm by email shortly.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      if (created) {
        form.reset();
      }
    }
  }

  if (status === "success" && confirmation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <CalendarCheck className="h-10 w-10 text-success" aria-hidden="true" />
          <p className="text-xl font-medium">Your table is held</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {confirmation.partySize} {confirmation.partySize === 1 ? "guest" : "guests"} on{" "}
            {formatRestaurantDate(confirmation.reservedFor, restaurant.timezone)}.
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            We&apos;ll email {confirmation.email}. Need to change something? Call {restaurant.phone}.
          </p>
          <Button className="mt-2" onClick={() => setStatus("idle")}>
            Book another table
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(503) 555-0142"
                required
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
            </Field>
            <Field label="Party size" htmlFor="partySize" error={errors.partySize}>
              <Select
                id="partySize"
                name="partySize"
                defaultValue="2"
                aria-invalid={errors.partySize ? true : undefined}
                aria-describedby={errors.partySize ? "partySize-error" : undefined}
              >
                {Array.from({ length: restaurant.maxPartySize }, (_, index) => index + 1).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="reservedDate" error={errors.reservedDate}>
              <Select
                id="reservedDate"
                name="reservedDate"
                value={dayKey}
                onChange={(event) => {
                  const nextDay = event.target.value;
                  setDayKey(nextDay);
                  setTimeKey(timesByDay.get(nextDay)?.[0]?.key ?? "");
                }}
                aria-invalid={errors.reservedDate ? true : undefined}
                aria-describedby={errors.reservedDate ? "reservedDate-error" : undefined}
              >
                {days.map((day) => (
                  <option key={day.key} value={day.key}>
                    {day.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Time" htmlFor="reservedTime" error={errors.reservedTime}>
              <Select
                id="reservedTime"
                name="reservedTime"
                value={timeKey}
                onChange={(event) => setTimeKey(event.target.value)}
                aria-invalid={errors.reservedTime ? true : undefined}
                aria-describedby={errors.reservedTime ? "reservedTime-error" : "reservedTime-hint"}
              >
                {times.map((time) => (
                  <option key={time.key} value={time.key}>
                    {time.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <p id="reservedTime-hint" className="-mt-2 text-xs text-muted-foreground">
            All times are restaurant time. Dinner service: {serviceHint}.
          </p>

          <Field label="Anything we should know?" htmlFor="notes" error={errors.notes}>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Allergies, celebrations, seating preference…"
              aria-invalid={errors.notes ? true : undefined}
              aria-describedby={errors.notes ? "notes-error" : undefined}
            />
          </Field>

          {status === "error" && message ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {message}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={status === "pending"}>
            {status === "pending" ? "Sending request…" : "Request a table"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
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
