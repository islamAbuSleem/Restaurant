"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, MenuItem } from "@restaurant/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";
import { createMenuItemAction, updateMenuItemAction } from "@/lib/actions/menu";

type MenuItemFormDialogProps = {
  categories: Category[];
  item?: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MenuItemFormDialog({ categories, item, open, onOpenChange }: MenuItemFormDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [image, setImage] = useState<{ url: string | null; key: string | null }>({
    url: item?.imageUrl ?? null,
    key: item?.imageKey ?? null,
  });

  async function handleSubmit(formData: FormData): Promise<void> {
    setError(null);
    setPending(true);
    formData.set("imageUrl", image.url ?? "");
    formData.set("imageKey", image.key ?? "");

    const result = item
      ? await updateMenuItemAction(item.id, formData)
      : await createMenuItemAction(formData);

    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save this item.");
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit menu item" : "New menu item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the details guests see on the menu." : "Add a dish to the public menu."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={item?.name} placeholder="Ember ribeye" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select id="categoryId" name="categoryId" defaultValue={item?.categoryId ?? categories[0]?.id}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="priceDollars">Price (USD)</Label>
              <Input
                id="priceDollars"
                name="priceDollars"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={item ? (item.priceCents / 100).toFixed(2) : ""}
                placeholder="24.00"
                required
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={item?.description}
                placeholder="What's on the plate, and why it's good."
                required
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadField value={image} onChange={setImage} />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                defaultChecked={item?.isAvailable ?? true}
                className="h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Label htmlFor="isAvailable">Available to order</Label>
            </div>
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : item ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
