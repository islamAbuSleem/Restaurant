import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OptionalJwtGuard } from "../../common/guards/optional-jwt.guard";
import type { AuthUser } from "../../common/types/auth-user";
import { CreateCheckoutDto } from "./dto/payments.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Post("checkout")
  createCheckout(@Body() dto: CreateCheckoutDto, @CurrentUser() user?: AuthUser) {
    return this.paymentsService.createCheckoutSession(dto.orderId, user);
  }

  @Public()
  @Post("webhook")
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string | undefined,
  ) {
    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}
