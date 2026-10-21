"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Category, MenuItem } from "@restaurant/shared";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenuItemFormDialog } from "@/components/dashboard/menu-item-form-dialog";
import { deleteMenuItemAction } from "@/lib/actions/menu";
import { formatPrice } from "@/lib/format";

type MenuTableProps = {
  categories: Category[];
  items: MenuItem[];
};

export function MenuTable({ categories, items }: MenuTableProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate(): void {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem): void {
    setEditing(item);
    setDialogOpen(true);
  }

  async function handleDelete(item: MenuItem): Promise<void> {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) {
      return;
    }
    setDeletingId(item.id);
    await deleteMenuItemAction(item.id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New item
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px]">
                <span className="sr-only">Photo</span>
              </TableHead>
              <TableHead>Dish</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-secondary">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-sm text-muted-foreground">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{item.name}</p>
                  <p className="hidden max-w-md truncate text-xs text-muted-foreground sm:block">
                    {item.description}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {categories.find((category) => category.id === item.categoryId)?.name ??
                    item.categoryName ??
                    "—"}
                </TableCell>
                <TableCell>{formatPrice(item.priceCents)}</TableCell>
                <TableCell>
                  <Badge variant={item.isAvailable ? "success" : "secondary"}>
                    {item.isAvailable ? "Available" : "Sold out"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${item.name}`}
                      disabled={deletingId === item.id}
                      onClick={() => void handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MenuItemFormDialog
        categories={categories}
        item={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
