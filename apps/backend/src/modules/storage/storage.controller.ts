import { Body, Controller, Post } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { PresignUploadDto } from "./dto/storage.dto";
import { StorageService } from "./storage.service";

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Roles("staff", "admin")
  @Post("presign")
  presign(@Body() dto: PresignUploadDto) {
    return this.storageService.createPresignedUpload(dto);
  }
}
