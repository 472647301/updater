import { Injectable, NestInterceptor } from '@nestjs/common'
import { ExecutionContext, CallHandler } from '@nestjs/common'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { Logs } from '@/utils/logs'
import { fetchIP } from '@/utils/utils'

type TRes = {
  data: object
  code: number
  message?: string
}

@Injectable()
export class TransformInterceptor implements NestInterceptor<object, TRes> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TRes> {
    const req = context.switchToHttp().getRequest<Request>()
    Logs.app.info(fetchIP(req), req.originalUrl, req.query, req.body)
    return next.handle().pipe(map(data => data))
  }
}
