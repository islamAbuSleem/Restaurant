import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { asc, eq, inArray } from "drizzle-orm";
import type { Category, MenuItem } from "@restaurant/shared";
import { DB, type Database } from "../../database/database.module";
import {
  menuCategories,
  menuItems,
  type MenuCategoryRow,
  type MenuItemRow,
} from "../../database/schema";
import { uniqueSlug } from "../../common/utils/slug";

function toCategory(row: MenuCategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, sortOrder: row.sortOrder };
}

function toMenuItem(row: MenuItemRow, categoryName?: string): MenuItem {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryName,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    imageKey: row.imageKey,
    isAvailable: row.isAvailable,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class MenuService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async listCategories(): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(menuCategories)
      .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name));
    return rows.map(toCategory);
  }

  async createCategory(input: { name: string; sortOrder?: number }): Promise<Category> {
    const slug = await uniqueSlug(input.name, async (candidate) => {
      const [row] = await this.db
        .select({ id: menuCategories.id })
        .from(menuCategories)
        .where(eq(menuCategories.slug, candidate))
        .limit(1);
      return Boolean(row);
    });
    const [row] = await this.db
      .insert(menuCategories)
      .values({ name: input.name, slug, sortOrder: input.sortOrder ?? 0 })
      .returning();
    if (!row) {
      throw new Error("[MenuService] Failed to create category");
    }
    return toCategory(row);
  }

  async listItems(options: {
    categorySlug?: string;
    includeUnavailable?: boolean;
  }): Promise<MenuItem[]> {
    const rows = await this.db
      .select({ item: menuItems, categoryName: menuCategories.name, categorySlug: menuCategories.slug })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .orderBy(asc(menuCategories.sortOrder), asc(menuItems.name));

    return rows
      .filter((row) => (options.categorySlug ? row.categorySlug === options.categorySlug : true))
      .filter((row) => (options.includeUnavailable ? true : row.item.isAvailable))
      .map((row) => toMenuItem(row.item, row.categoryName));
  }

  async getItemBySlug(slug: string): Promise<MenuItem> {
    const rows = await this.db
      .select({ item: menuItems, categoryName: menuCategories.name })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(eq(menuItems.slug, slug))
      .limit(1);
    const row = rows[0];
    if (!row) {
      throw new NotFoundException({ code: "MENU_ITEM_NOT_FOUND", message: "Menu item not found" });
    }
    return toMenuItem(row.item, row.categoryName);
  }

  async getItemById(id: string): Promise<MenuItemRow> {
    const [row] = await this.db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
    if (!row) {
      throw new NotFoundException({ code: "MENU_ITEM_NOT_FOUND", message: "Menu item not found" });
    }
    return row;
  }

  async createItem(input: {
    categoryId: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl?: string | null;
    imageKey?: string | null;
    isAvailable?: boolean;
  }): Promise<MenuItem> {
    await this.assertCategoryExists(input.categoryId);
    const slug = await uniqueSlug(input.name, async (candidate) => {
      const [row] = await this.db
        .select({ id: menuItems.id })
        .from(menuItems)
        .where(eq(menuItems.slug, candidate))
        .limit(1);
      return Boolean(row);
    });
    const [row] = await this.db
      .insert(menuItems)
      .values({
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description,
        priceCents: input.priceCents,
        imageUrl: input.imageUrl ?? null,
        imageKey: input.imageKey ?? null,
        isAvailable: input.isAvailable ?? true,
      })
      .returning();
    if (!row) {
      throw new Error("[MenuService] Failed to create menu item");
    }
    return toMenuItem(row);
  }

  async updateItem(
    id: string,
    input: {
      categoryId?: string;
      name?: string;
      description?: string;
      priceCents?: number;
      imageUrl?: string | null;
      imageKey?: string | null;
      isAvailable?: boolean;
    },
  ): Promise<MenuItem> {
    await this.getItemById(id);
    if (input.categoryId) {
      await this.assertCategoryExists(input.categoryId);
    }
    const [row] = await this.db
      .update(menuItems)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) {
      throw new Error("[MenuService] Failed to update menu item");
    }
    return toMenuItem(row);
  }

  async deleteItem(id: string): Promise<{ id: string }> {
    const existing = await this.getItemById(id);
    try {
      await this.db.delete(menuItems).where(eq(menuItems.id, id));
    } catch {
      throw new ConflictException({
        code: "MENU_ITEM_IN_USE",
        message: "This item has orders. Mark it unavailable instead.",
      });
    }
    return { id: existing.id };
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const [row] = await this.db
      .select({ id: menuCategories.id })
      .from(menuCategories)
      .where(eq(menuCategories.id, categoryId))
      .limit(1);
    if (!row) {
      throw new BadRequestException({
        code: "CATEGORY_NOT_FOUND",
        message: "Category does not exist",
      });
    }
  }

  async findItemsByIds(ids: string[]): Promise<Map<string, MenuItemRow>> {
    if (ids.length === 0) {
      return new Map();
    }
    const rows = await this.db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, ids));
    return new Map(rows.map((row) => [row.id, row]));
  }
}
