export type ServiceWindow = {
  openHour: number;
  closeHour: number;
  closed: boolean;
};

/** Weekly service windows, keyed by weekday index (0 = Sunday … 6 = Saturday). */
export type ServiceHours = Record<number, ServiceWindow>;

export type TaxPolicy = "none" | "included" | "rate";

export type RestaurantProfile = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  phoneHref: string;
  timezone: string;
  currency: string;
  seatsDiningRoom: number;
  seatsCounter: number;
  maxPartySize: number;
  taxPolicy: TaxPolicy;
  taxRateBps: number | null;
  collectionPoint: string;
  hours: ServiceHours;
  hoursSummary: string;
};

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
};

/** Calendar and clock reading at the restaurant, whatever timezone the caller is in. */
function zonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(read("weekday"));
  return {
    year: Number(read("year")),
    month: Number(read("month")) - 1,
    day: Number(read("day")),
    hour: Number(read("hour")) % 24,
    minute: Number(read("minute")),
    weekday: weekdayIndex === -1 ? 0 : weekdayIndex,
  };
}

/** The instant for a wall-clock time at the restaurant. */
function restaurantInstant(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  const wall = Date.UTC(year, month, day, hour, minute);
  let instant = new Date(wall);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const at = zonedParts(instant, timeZone);
    const drift = wall - Date.UTC(at.year, at.month, at.day, at.hour, at.minute);
    if (drift === 0) {
      break;
    }
    instant = new Date(instant.getTime() + drift);
  }

  return instant;
}

export function serviceWindowFor(date: Date, hours: ServiceHours, timeZone: string): ServiceWindow {
  const { weekday } = zonedParts(date, timeZone);
  return hours[weekday] ?? { openHour: 0, closeHour: 0, closed: true };
}

export function isWithinServiceWindow(
  date: Date,
  hours: ServiceHours,
  timeZone: string,
): boolean {
  const window = serviceWindowFor(date, hours, timeZone);
  if (window.closed) {
    return false;
  }
  const { hour, minute } = zonedParts(date, timeZone);
  const hoursElapsed = hour + minute / 60;
  return hoursElapsed >= window.openHour && hoursElapsed < window.closeHour;
}

/** True when both instants fall on the same calendar day at the restaurant. */
export function isSameRestaurantDay(left: Date, right: Date, timeZone: string): boolean {
  const a = zonedParts(left, timeZone);
  const b = zonedParts(right, timeZone);
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function formatServiceWindow(window: ServiceWindow): string {
  if (window.closed) {
    return "closed";
  }
  return `${formatHour(window.openHour)} – ${formatHour(window.closeHour)}`;
}

export function serviceWindowMessage(
  date: Date,
  hours: ServiceHours,
  timeZone: string,
): string {
  const window = serviceWindowFor(date, hours, timeZone);
  if (window.closed) {
    return "We are closed that day. Pick another day and we will hold you a seat.";
  }
  return `Dinner service runs ${formatServiceWindow(window)} that day. Pick a time inside service hours.`;
}

/** The next bookable moment, used as the default date and time in the reservation form. */
export function nextServiceSlot(
  from: Date = new Date(),
  hours: ServiceHours = {},
  timeZone = "UTC",
): Date {
  const start = zonedParts(from, timeZone);

  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const weekday = new Date(Date.UTC(start.year, start.month, start.day + dayOffset)).getUTCDay();
    const window = hours[weekday];
    if (!window || window.closed) {
      continue;
    }
    const opens = restaurantInstant(timeZone, start.year, start.month, start.day + dayOffset, window.openHour);
    const closes = restaurantInstant(timeZone, start.year, start.month, start.day + dayOffset, window.closeHour);
    if (from.getTime() < opens.getTime()) {
      return opens;
    }
    if (from.getTime() < closes.getTime()) {
      const rounded = new Date(
        Math.ceil(from.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000),
      );
      if (rounded.getTime() < closes.getTime()) {
        return rounded;
      }
    }
  }

  return from;
}

export type PickupSlot = {
  value: string;
  label: string;
};

/** A service day at the restaurant, in restaurant-local calendar terms. */
export type ServiceDay = {
  key: string;
  label: string;
  year: number;
  month: number;
  day: number;
};

/** A bookable time within a service day, in restaurant time. */
export type ServiceTime = {
  key: string;
  label: string;
  instant: string;
};

/** The next open days, as restaurant-local calendar dates. */
export function serviceDays(
  hours: ServiceHours = {},
  timeZone = "UTC",
  from: Date = new Date(),
  count = 14,
): ServiceDay[] {
  const start = zonedParts(from, timeZone);
  const days: ServiceDay[] = [];

  for (let offset = 0; offset < count * 2 && days.length < count; offset += 1) {
    const date = new Date(Date.UTC(start.year, start.month, start.day + offset));
    const window = hours[date.getUTCDay()];
    if (!window || window.closed) {
      continue;
    }
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
    days.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`,
      label,
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
    });
  }

  return days;
}

/** The bookable times within a service day, every 30 minutes inside service hours. */
export function serviceTimes(
  hours: ServiceHours = {},
  timeZone = "UTC",
  day: ServiceDay,
  intervalMinutes = 30,
): ServiceTime[] {
  const weekday = new Date(Date.UTC(day.year, day.month, day.day)).getUTCDay();
  const window = hours[weekday];
  if (!window || window.closed) {
    return [];
  }

  const times: ServiceTime[] = [];
  for (let minutes = window.openHour * 60; minutes < window.closeHour * 60; minutes += intervalMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const instant = restaurantInstant(timeZone, day.year, day.month, day.day, hour, minute);
    times.push({
      key: `${hour}:${String(minute).padStart(2, "0")}`,
      label: formatClock(hour, minute),
      instant: instant.toISOString(),
    });
  }

  return times;
}

/**
 * Pickup slots for the next few days, limited to service hours and a short
 * kitchen lead time. Times are shown in restaurant time.
 */
export function pickupSlotOptions(
  from: Date = new Date(),
  hours: ServiceHours = {},
  timeZone = "UTC",
  days = 3,
): PickupSlot[] {
  const slots: PickupSlot[] = [];
  const earliest = from.getTime() + 45 * 60 * 1000;
  const start = zonedParts(from, timeZone);

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const weekday = new Date(Date.UTC(start.year, start.month, start.day + dayOffset)).getUTCDay();
    const window = hours[weekday];
    if (!window || window.closed) {
      continue;
    }
    for (let hour = window.openHour; hour < window.closeHour; hour += 1) {
      const instant = restaurantInstant(timeZone, start.year, start.month, start.day + dayOffset, hour);
      if (instant.getTime() < earliest) {
        continue;
      }
      slots.push({ value: instant.toISOString(), label: formatSlotLabel(instant, dayOffset, timeZone) });
    }
  }

  return slots;
}

/** The service window rows a guest sees, in display order. */
export function serviceHoursRows(
  hours: ServiceHours,
  timeZone: string,
): { day: string; time: string }[] {
  const groups: { days: number[]; label: string }[] = [
    { days: [2, 3, 4], label: "Tuesday – Thursday" },
    { days: [5, 6], label: "Friday – Saturday" },
    { days: [0], label: "Sunday" },
    { days: [1], label: "Monday" },
  ];

  return groups.map((group) => {
    const firstDay = group.days[0];
    const first = firstDay === undefined ? undefined : hours[firstDay];
    const same = group.days.every((day) => {
      const window = hours[day];
      return (
        window &&
        first &&
        window.closed === first.closed &&
        window.openHour === first.openHour &&
        window.closeHour === first.closeHour
      );
    });
    if (!first) {
      return { day: group.label, time: "Closed" };
    }
    if (!same) {
      return {
        day: group.label,
        time: group.days
          .map((day) => {
            const window = hours[day];
            if (!window) {
              return "Closed";
            }
            return window.closed ? "Closed" : formatServiceWindow(window);
          })
          .join(", "),
      };
    }
    return {
      day: group.label,
      time: first.closed ? "Closed" : formatServiceWindow(first),
    };
  });
}

/** One line a guest can scan in the footer. */
function formatSlotLabel(instant: Date, dayOffset: number, timeZone: string): string {
  const parts = zonedParts(instant, timeZone);
  const time = formatClock(parts.hour, parts.minute);
  if (dayOffset === 0) {
    return `Today, ${time}`;
  }
  if (dayOffset === 1) {
    return `Tomorrow, ${time}`;
  }
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(instant);
  return `${date}, ${time}`;
}

function formatClock(hour: number, minute: number): string {
  const suffix = hour >= 12 ? "pm" : "am";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  if (minute === 0) {
    return `${display}${suffix}`;
  }
  return `${display}:${String(minute).padStart(2, "0")}${suffix}`;
}

function formatHour(hour: number): string {
  if (hour === 0) {
    return "12am";
  }
  if (hour < 12) {
    return `${hour}am`;
  }
  if (hour === 12) {
    return "12pm";
  }
  return `${hour - 12}pm`;
}
