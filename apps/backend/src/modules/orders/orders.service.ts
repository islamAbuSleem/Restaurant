import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  isWithinServiceWindow,
  ORDER_STATUSES,
  serviceWindowMessage,
  type Order,
  type OrderStatus,
} from "@restaurant/shared";
import { DB, type Database } from "../../database/database.module";
import { orderItems, orders, type OrderItemRow, type OrderRow } from "../../database/schema";
import { MenuService } from "../menu/menu.service";
import { RestaurantsService } from "../restaurants/restaurants.service";
import type { AuthUser } from "../../common/types/auth-user";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["preparing", "cancelled", "completed"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly menuService: MenuService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(
    input: {
      items: { menuItemId: string; quantity: number }[];
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      pickupAt?: string;
    },
    user?: AuthUser,
  ): Promise<Order> {
    const pickupAt = input.pickupAt ? new Date(input.pickupAt) : null;
    if (pickupAt) {
      const profile = await this.restaurantsService.getCurrent();
      if (Number.isNaN(pickupAt.getTime()) || !isWithinServiceWindow(pickupAt, profile.hours, profile.timezone)) {
        throw new BadRequestException({
          code: "INVALID_PICKUP_TIME",
          message: serviceWindowMessage(pickupAt, profile.hours, profile.timezone),
        });
      }
    }

    const uniqueIds = [...new Set(input.items.map((line) => line.menuItemId))];
    const itemsById = await this.menuService.findItemsByIds(uniqueIds);
    if (itemsById.size !== uniqueIds.length) {
      throw new BadRequestException({
        code: "MENU_ITEM_NOT_FOUND",
        message: "One of the items in your cart is no longer available",
      });
    }

    const unavailable = uniqueIds.filter((id) => !itemsById.get(id)?.isAvailable);
    if (unavailable.length > 0) {
      throw new BadRequestException({
        code: "MENU_ITEM_UNAVAILABLE",
        message: "One of the items in your cart is no longer available",
      });
    }

    const lines = input.items.map((line) => {
      const item = itemsById.get(line.menuItemId);
      if (!item) {
        throw new BadRequestException({ code: "MENU_ITEM_NOT_FOUND", message: "Item not found" });
      }
      return {
        menuItemId: item.id,
        nameSnapshot: item.name,
        priceCents: item.priceCents,
        quantity: line.quantity,
      };
    });
    const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);

    const order = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(orders)
        .values({
          userId: user?.id ?? null,
          status: "pending",
          totalCents,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          pickupAt,
        })
        .returning();
      if (!created) {
        throw new Error("[OrdersService] Failed to create order");
      }
      const insertedItems = await tx
        .insert(orderItems)
        .values(lines.map((line) => ({ ...line, orderId: created.id })))
        .returning();
      return { created, insertedItems };
    });

    return this.toOrder(order.created, order.insertedItems);
  }

  async listMine(userId: string): Promise<Order[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return this.hydrate(rows);
  }

  async listAll(): Promise<Order[]> {
    const rows = await this.db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
    return this.hydrate(rows);
  }

  async getByIdForUser(id: string, user?: AuthUser): Promise<Order> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!row) {
      throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    }
    const isOwner = user && row.userId === user.id;
    const isStaff = user && (user.role === "staff" || user.role === "admin");
    if (row.userId && !isOwner && !isStaff) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "You do not have access to this order" });
    }
    return this.hydrateOne(row);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!row) {
      throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    }
    const allowed = ALLOWED_TRANSITIONS[row.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException({
        code: "INVALID_STATUS_TRANSITION",
        message: `Cannot move an order from ${row.status} to ${status}`,
      });
    }
    const [updated] = await this.db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!updated) {
      throw new Error("[OrdersService] Failed to update order status");
    }
    return this.hydrateOne(updated);
  }

  async markPaidBySessionId(sessionId: string): Promise<void> {
    await this.db
      .update(orders)
      .set({ status: "paid", updatedAt: new Date() })
      .where(and(eq(orders.stripeSessionId, sessionId), eq(orders.status, "pending")));
  }

  async attachStripeSession(id: string, sessionId: string): Promise<void> {
    await this.db
      .update(orders)
      .set({ stripeSessionId: sessionId, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async getRawById(id: string): Promise<OrderRow | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return row ?? null;
  }

  private async hydrate(rows: OrderRow[]): Promise<Order[]> {
    if (rows.length === 0) {
      return [];
    }
    const items = await this.db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, rows.map((row) => row.id)));
    const byOrder = new Map<string, OrderItemRow[]>();
    for (const item of items) {
      const bucket = byOrder.get(item.orderId) ?? [];
      bucket.push(item);
      byOrder.set(item.orderId, bucket);
    }
    return rows.map((row) => this.toOrder(row, byOrder.get(row.id) ?? []));
  }

  private async hydrateOne(row: OrderRow): Promise<Order> {
    const items = await this.db.select().from(orderItems).where(eq(orderItems.orderId, row.id));
    return this.toOrder(row, items);
  }

  private toOrder(row: OrderRow, items: OrderItemRow[]): Order {
    const status = ORDER_STATUSES.includes(row.status) ? row.status : "pending";
    return {
      id: row.id,
      userId: row.userId,
      status,
      totalCents: row.totalCents,
      customerEmail: row.customerEmail,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      pickupAt: row.pickupAt ? row.pickupAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      items: items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        nameSnapshot: item.nameSnapshot,
        priceCents: item.priceCents,
        quantity: item.quantity,
      })),
    };
  }
}
