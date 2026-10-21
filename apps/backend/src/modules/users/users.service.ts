import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { Role } from "@restaurant/shared";
import { DB, type Database } from "../../database/database.module";
import { users, type UserRow } from "../../database/schema";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async findOrFail(id: string): Promise<UserRow> {
    const row = await this.findById(id);
    if (!row) {
      throw new NotFoundException({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    return row;
  }

  async create(input: {
    email: string;
    name: string;
    passwordHash: string | null;
    googleId?: string | null;
    role?: Role;
  }): Promise<UserRow> {
    const [row] = await this.db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        googleId: input.googleId ?? null,
        role: input.role ?? "customer",
      })
      .returning();
    if (!row) {
      throw new Error("[UsersService] Failed to create user");
    }
    return row;
  }

  async linkGoogle(id: string, googleId: string): Promise<UserRow> {
    const [row] = await this.db
      .update(users)
      .set({ googleId, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    return row;
  }
}
