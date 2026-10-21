import {
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { RESERVATION_STATUSES, MAX_PARTY_SIZE_CEILING, type ReservationStatus } from "@restaurant/shared";

export class CreateReservationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(24)
  phone!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_PARTY_SIZE_CEILING)
  partySize!: number;

  @IsISO8601()
  reservedFor!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  notes?: string;
}

export class UpdateReservationStatusDto {
  @IsIn(RESERVATION_STATUSES)
  status!: ReservationStatus;
}
