import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { API_BASE_PATH } from "@restaurant/shared";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

export function configureApp(app: INestApplication): void {
  const logger = new Logger("Bootstrap");
  app.setGlobalPrefix(API_BASE_PATH.replace(/^\//, ""));

  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  app.enableCors({ origin: webOrigin, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  logger.log(`CORS origin: ${webOrigin}`);
}
