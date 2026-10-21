import { z } from "zod";
import { ORDER_STATUSES } from "../constants";

export const cartLineSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});
export type CartLine = z.infer<typeof cartLineSchema>;

export const createOrderSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  customerName: z.string().trim().min(2, "Tell us who to hand the order to").max(80),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  customerPhone: z
    .string()
    .trim()
    .min(7, "Enter a phone number so the kitchen can reach you")
    .max(24),
  pickupAt: z.string().datetime({ offset: true }).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  nameSnapshot: z.string(),
  priceCents: z.number().int(),
  quantity: z.number().int(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  status: z.enum(ORDER_STATUSES),
  totalCents: z.number().int(),
  customerEmail: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  pickupAt: z.string().nullable().optional(),
  createdAt: z.string(),
  items: z.array(orderItemSchema),
});
export type Order = z.infer<typeof orderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
