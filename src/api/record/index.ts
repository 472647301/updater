import { Body, Controller, Req, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { ApiResult } from '@/decorators'
import { RecordService } from './record.service'
import { RecordPageBody } from './record.dto'
import { RecordEntity } from '@/entities/record.entity'

@ApiTags('record')
@Controller('record')
export class RecordController {
  constructor(private readonly service: RecordService) {}

  @Post('page')
  @ApiOperation({ summary: '分页列表' })
  @ApiResult({ type: RecordEntity, isPage: true })
  page(@Req() req: Request, @Body() body: RecordPageBody) {
    return this.service.page(req, body)
  }
}
