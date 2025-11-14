import { Body, Controller, Req, Post } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { ApiResult, Public } from '@/decorators'
import { ReportErrorEntity, ReportPageBody } from './report.dto'
import { ReportEntity } from '@/entities/report.entity'
import { ReportService } from './report.service'

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Post('page')
  @ApiBearerAuth()
  @ApiOperation({ summary: '分页列表' })
  @ApiResult({ type: ReportEntity, isPage: true })
  page(@Body() body: ReportPageBody) {
    return this.service.page(body)
  }

  @Public()
  @Post('error')
  @ApiOperation({ summary: '上报错误' })
  @ApiResult({ type: ReportErrorEntity })
  error(@Req() req: Request) {
    return this.service.error(req)
  }
}
