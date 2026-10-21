import type { Role } from "@restaurant/shared";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};
