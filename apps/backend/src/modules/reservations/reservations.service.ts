import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm";
import {
  isWithinServiceWindow,
  serviceWindowMessage,
  type Reservation,
  type ReservationStatus,
} from "@restaurant/shared";
import { DB, type Database } from "../../database/database.module";
import { diningTables, reservations, type ReservationRow } from "../../database/schema";
import { RestaurantsService } from "../restaurants/restaurants.service";

const ACTIVE_STATUSES: ReservationStatus[] = ["pending", "confirmed"];

function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    userId: row.userId,
    tableId: row.tableId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    partySize: row.partySize,
    reservedFor: row.reservedFor.toISOString(),
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class ReservationsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(input: {
    name: string;
    email: string;
    phone: string;
    partySize: number;
    reservedFor: string;
    notes?: string;
    userId?: string;
  }): Promise<Reservation> {
    const profile = await this.restaurantsService.getCurrent();
    const reservedFor = new Date(input.reservedFor);
    if (Number.isNaN(reservedFor.getTime()) || reservedFor.getTime() < Date.now()) {
      throw new ConflictException({
        code: "INVALID_RESERVATION_TIME",
        message: "Choose a time in the future",
      });
    }

    if (input.partySize > profile.maxPartySize) {
      throw new BadRequestException({
        code: "PARTY_SIZE_TOO_LARGE",
        message: `For parties over ${profile.maxPartySize}, call ${profile.phone}.`,
      });
    }

    if (!isWithinServiceWindow(reservedFor, profile.hours, profile.timezone)) {
      throw new ConflictException({
        code: "SERVICE_CLOSED",
        message: serviceWindowMessage(reservedFor, profile.hours, profile.timezone),
      });
    }

    const windowStart = new Date(reservedFor.getTime() - 60 * 60 * 1000);
    const windowEnd = new Date(reservedFor.getTime() + 60 * 60 * 1000);
    const [capacityRow] = await this.db
      .select({ seats: sql<number>`coalesce(sum(${diningTables.seats}), 0)::int` })
      .from(diningTables)
      .where(eq(diningTables.isActive, true));
    const capacity = capacityRow?.seats ?? 0;

    const [bookedRow] = await this.db
      .select({ guests: sql<number>`coalesce(sum(${reservations.partySize}), 0)::int` })
      .from(reservations)
      .where(
        and(
          inArray(reservations.status, ACTIVE_STATUSES),
          gte(reservations.reservedFor, windowStart),
          lte(reservations.reservedFor, windowEnd),
        ),
      );
    const booked = bookedRow?.guests ?? 0;

    if (capacity > 0 && booked + input.partySize > capacity) {
      throw new ConflictException({
        code: "RESERVATION_FULL",
        message: "That time is fully booked. Please choose another slot.",
      });
    }

    const [row] = await this.db
      .insert(reservations)
      .values({
        userId: input.userId ?? null,
        name: input.name,
        email: input.email,
        phone: input.phone,
        partySize: input.partySize,
        reservedFor,
        notes: input.notes ?? null,
        status: "pending",
      })
      .returning();
    if (!row) {
      throw new Error("[ReservationsService] Failed to create reservation");
    }
    return toReservation(row);
  }

  async listAll(): Promise<Reservation[]> {
    const rows = await this.db
      .select()
      .from(reservations)
      .orderBy(desc(reservations.reservedFor))
      .limit(200);
    return rows.map(toReservation);
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const [updated] = await this.db
      .update(reservations)
      .set({ status })
      .where(and(eq(reservations.id, id), ne(reservations.status, status)))
      .returning();
    if (!updated) {
      const [existing] = await this.db
        .select()
        .from(reservations)
        .where(eq(reservations.id, id))
        .limit(1);
      if (!existing) {
        throw new NotFoundException({
          code: "RESERVATION_NOT_FOUND",
          message: "Reservation not found",
        });
      }
      return toReservation(existing);
    }
    return toReservation(updated);
  }
}
