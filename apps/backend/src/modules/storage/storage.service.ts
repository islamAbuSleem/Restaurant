import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export type PresignResult = {
  uploadUrl: string;
  url: string;
  key: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | null = null;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>("STORAGE_ENDPOINT");
    const accessKeyId = this.config.get<string>("STORAGE_ACCESS_KEY_ID");
    const secretAccessKey = this.config.get<string>("STORAGE_SECRET_ACCESS_KEY");
    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: this.config.get<string>("STORAGE_REGION") ?? "us-east-1",
        endpoint,
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.logger.warn("Storage disabled: set STORAGE_* environment variables to enable uploads");
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async createPresignedUpload(input: {
    fileName: string;
    contentType: string;
  }): Promise<PresignResult> {
    const client = this.requireClient();
    const bucket = this.config.get<string>("STORAGE_BUCKET") ?? "menu-images";
    const extension = EXTENSION_BY_TYPE[input.contentType] ?? extname(input.fileName) ?? "";
    const key = `menu/${randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: input.contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    return { uploadUrl, url: this.publicUrl(key), key };
  }

  async deleteObject(key: string): Promise<void> {
    const client = this.requireClient();
    const bucket = this.config.get<string>("STORAGE_BUCKET") ?? "menu-images";
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  private publicUrl(key: string): string {
    const base =
      this.config.get<string>("STORAGE_PUBLIC_BASE_URL") ??
      this.config.get<string>("STORAGE_ENDPOINT") ??
      "";
    const bucket = this.config.get<string>("STORAGE_BUCKET") ?? "menu-images";
    return base.includes("://") && base.includes(bucket)
      ? `${base.replace(/\/$/, "")}/${key}`
      : `${base.replace(/\/$/, "")}/${bucket}/${key}`;
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableException({
        code: "STORAGE_NOT_CONFIGURED",
        message: "Image uploads are not configured",
      });
    }
    return this.client;
  }
}
