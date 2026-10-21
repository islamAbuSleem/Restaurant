"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@restaurant/shared";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type UploadedImage = {
  url: string | null;
  key: string | null;
};

type ImageUploadFieldProps = {
  value: UploadedImage;
  onChange: (value: UploadedImage) => void;
};

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  async function handleFile(file: File): Promise<void> {
    setError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Images must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const presignResponse = await fetch(`${API_URL}/storage/presign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const presignPayload = (await presignResponse.json()) as {
        success: boolean;
        data?: { uploadUrl: string; url: string; key: string };
        error?: { code: string; message: string };
      };

      if (!presignPayload.success || !presignPayload.data) {
        setError(
          presignPayload.error?.code === "STORAGE_NOT_CONFIGURED"
            ? "Uploads aren't configured yet — paste an image URL below instead."
            : (presignPayload.error?.message ?? "Could not start the upload."),
        );
        return;
      }

      const upload = await fetch(presignPayload.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!upload.ok) {
        setError("Upload failed. Please try again.");
        return;
      }

      onChange({ url: presignPayload.data.url, key: presignPayload.data.key });
    } catch {
      setError("Upload failed. Check the API connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="image-file">Photo</Label>

      {value.url ? (
        <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-secondary">
          <Image src={value.url} alt="Menu item photo" fill sizes="(max-width: 640px) 100vw, 480px" className="object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Remove photo"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => onChange({ url: null, key: null })}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card/50 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              Click to upload — JPEG, PNG, or WebP up to 5 MB
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        id="image-file"
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.target.value = "";
        }}
      />

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="image-url" className="text-xs text-muted-foreground">
            …or paste an image URL
          </Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://…"
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const trimmed = manualUrl.trim();
            if (trimmed.length === 0) {
              return;
            }
            setError(null);
            onChange({ url: trimmed, key: null });
            setManualUrl("");
          }}
        >
          Use URL
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
