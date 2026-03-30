import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (
          value &&
          typeof value === 'object' &&
          'data' in value &&
          'message' in value
        ) {
          return {
            success: true,
            ...(value as Record<string, unknown>),
          };
        }

        return {
          success: true,
          data: value,
        };
      }),
    );
  }
}
