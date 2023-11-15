import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { UserReponseDto } from 'src/users/dtos/user-response.dto';

// interface to check that it's a class
interface CLassConstructor {
  new (...args: any[]): {};
}
export function Serialize(dto: CLassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    //run before handler

    return next.handle().pipe(
      map((data: any) => {
        //run something before response is sent out
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
