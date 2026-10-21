import { z } from "zod";

export const apiSuccessSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.literal(true), data });

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof paginationSchema>;

export type Paginated<T> = { items: T[]; page: number; limit: number; total: number };
