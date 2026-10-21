import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeClient {
  private readonly logger = new Logger(StripeClient.name);
  private client: Stripe | null = null;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>("STRIPE_SECRET_KEY");
    if (key) {
      this.client = new Stripe(key);
    } else {
      this.logger.warn("Stripe disabled: set STRIPE_SECRET_KEY to enable checkout");
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  getClient(): Stripe {
    if (!this.client) {
      throw new ServiceUnavailableException({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Online payment is not available right now",
      });
    }
    return this.client;
  }
}
