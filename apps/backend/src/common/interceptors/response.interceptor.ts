import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

type WrappedResponse = { success?: boolean; data?: unknown };

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (
          typeof data === "object" &&
          data !== null &&
          "success" in data &&
          (data as WrappedResponse).success !== undefined
        ) {
          return data;
        }
        return { success: true, data: data ?? null };
      }),
    );
  }
}
