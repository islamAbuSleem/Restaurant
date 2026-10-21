import { Module } from "@nestjs/common";
import { MenuModule } from "../menu/menu.module";
import { RestaurantsModule } from "../restaurants/restaurants.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [MenuModule, RestaurantsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
