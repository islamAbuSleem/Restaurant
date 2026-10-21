import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type Stripe from "stripe";
import type { AuthUser } from "../../common/types/auth-user";
import { OrdersService } from "../orders/orders.service";
import { StripeClient } from "./stripe.client";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly stripeClient: StripeClient,
    private readonly ordersService: OrdersService,
    private readonly config: ConfigService,
  ) {}

  async createCheckoutSession(orderId: string, user?: AuthUser): Promise<{ url: string }> {
    const order = await this.ordersService.getRawById(orderId);
    if (!order) {
      throw new BadRequestException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    }
    if (order.status !== "pending") {
      throw new BadRequestException({
        code: "ORDER_NOT_PAYABLE",
        message: "This order is no longer awaiting payment",
      });
    }

    const hydrated = await this.ordersService.getByIdForUser(orderId, user);
    const webOrigin = this.config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000";
    const currency = this.config.get<string>("STRIPE_CURRENCY") ?? "usd";
    const stripe = this.stripeClient.getClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? order.customerEmail ?? undefined,
      line_items: hydrated.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency,
          unit_amount: item.priceCents,
          product_data: { name: item.nameSnapshot },
        },
      })),
      success_url: `${webOrigin}/orders/${order.id}?status=success`,
      cancel_url: `${webOrigin}/cart`,
      metadata: { orderId: order.id },
    });

    if (!session.url) {
      throw new BadRequestException({
        code: "CHECKOUT_FAILED",
        message: "Could not start checkout",
      });
    }
    await this.ordersService.attachStripeSession(order.id, session.id);
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<{ received: boolean }> {
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!secret) {
      this.logger.warn("[webhook] STRIPE_WEBHOOK_SECRET not set; ignoring event");
      return { received: true };
    }
    if (!signature) {
      throw new BadRequestException({ code: "MISSING_SIGNATURE", message: "Missing signature" });
    }

    let event: Stripe.Event;
    try {
      event = this.stripeClient.getClient().webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException({
        code: "INVALID_SIGNATURE",
        message: "Invalid webhook signature",
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.ordersService.markPaidBySessionId(session.id);
    }
    return { received: true };
  }
}
