import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ORDER_STATUSES, type OrderStatus } from "@restaurant/shared";

export class OrderLineDto {
  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items!: OrderLineDto[];

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(24)
  customerPhone!: string;

  @IsOptional()
  @IsISO8601()
  pickupAt?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status!: OrderStatus;
}
