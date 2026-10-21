import { IsIn, IsString, MaxLength, MinLength } from "class-validator";
import { ALLOWED_IMAGE_TYPES } from "@restaurant/shared";

export class PresignUploadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fileName!: string;

  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType!: (typeof ALLOWED_IMAGE_TYPES)[number];
}
