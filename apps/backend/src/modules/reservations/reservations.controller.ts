import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OptionalJwtGuard } from "../../common/guards/optional-jwt.guard";
import type { AuthUser } from "../../common/types/auth-user";
import { CreateReservationDto, UpdateReservationStatusDto } from "./dto/reservations.dto";
import { ReservationsService } from "./reservations.service";

@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Post()
  create(@Body() dto: CreateReservationDto, @CurrentUser() user?: AuthUser) {
    return this.reservationsService.create({ ...dto, userId: user?.id });
  }

  @Roles("staff", "admin")
  @Get()
  listAll() {
    return this.reservationsService.listAll();
  }

  @Roles("staff", "admin")
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, dto.status);
  }
}
