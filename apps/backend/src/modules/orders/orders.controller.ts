import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OptionalJwtGuard } from "../../common/guards/optional-jwt.guard";
import type { AuthUser } from "../../common/types/auth-user";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/orders.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: AuthUser) {
    return this.ordersService.create(dto, user);
  }

  @Get("me")
  listMine(@CurrentUser() user: AuthUser) {
    return this.ordersService.listMine(user.id);
  }

  @Roles("staff", "admin")
  @Get()
  listAll() {
    return this.ordersService.listAll();
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get(":id")
  getOne(@Param("id") id: string, @CurrentUser() user?: AuthUser) {
    return this.ordersService.getByIdForUser(id, user);
  }

  @Roles("staff", "admin")
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
