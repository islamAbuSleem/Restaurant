import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";

@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check(): { status: string; uptime: number } {
    return { status: "ok", uptime: Math.round(process.uptime()) };
  }
}
