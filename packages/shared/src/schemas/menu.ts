import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number().int(),
});
export type Category = z.infer<typeof categorySchema>;

export const menuItemSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  categoryName: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  priceCents: z.number().int().nonnegative(),
  imageUrl: z.string().nullable(),
  imageKey: z.string().nullable(),
  isAvailable: z.boolean(),
  createdAt: z.string().optional(),
});
export type MenuItem = z.infer<typeof menuItemSchema>;

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid("Choose a category"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(600),
  priceCents: z.number().int().positive("Price must be greater than zero"),
  imageUrl: z.string().url().nullable().optional(),
  imageKey: z.string().nullable().optional(),
  isAvailable: z.boolean().optional(),
});
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = createMenuItemSchema.partial();
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  sortOrder: z.number().int().nonnegative().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
