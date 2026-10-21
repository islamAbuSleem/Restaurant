import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

type ErrorPayload = { code?: string; message?: string | string[] };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("HttpExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const { code, message } = this.normalize(body, exception.message);
      response.status(status).json({ success: false, error: { code, message } });
      return;
    }

    this.logger.error(
      `Unhandled error: ${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
    });
  }

  private normalize(body: string | object, fallback: string): { code: string; message: string } {
    if (typeof body === "string") {
      return { code: "REQUEST_FAILED", message: body };
    }
    const payload = body as ErrorPayload;
    const rawMessage = payload.message ?? fallback;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
    return { code: payload.code ?? "REQUEST_FAILED", message };
  }
}
