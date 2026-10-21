import { z } from "zod";
import { RESERVATION_STATUSES } from "../constants";

/** Hard ceiling only. The real limit belongs to the restaurant and is enforced per profile. */
export const MAX_PARTY_SIZE_CEILING = 50;

export const createReservationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(24),
  partySize: z
    .number()
    .int()
    .min(1, "At least 1 guest")
    .max(MAX_PARTY_SIZE_CEILING, "Call us for larger groups"),
  reservedFor: z.string().datetime({ offset: true, message: "Choose a date and time" }),
  notes: z.string().trim().max(400).optional(),
});
export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const reservationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  tableId: z.string().uuid().nullable(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  partySize: z.number().int(),
  reservedFor: z.string(),
  status: z.enum(RESERVATION_STATUSES),
  notes: z.string().nullable(),
  createdAt: z.string(),
});
export type Reservation = z.infer<typeof reservationSchema>;

export const updateReservationStatusSchema = z.object({
  status: z.enum(RESERVATION_STATUSES),
});
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;
