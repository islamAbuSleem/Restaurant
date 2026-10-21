export const ROLES = ["customer", "staff", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES: readonly Role[] = ["staff", "admin"];

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const RESERVATION_STATUSES = ["pending", "confirmed", "seated", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const API_BASE_PATH = "/api/v1";
