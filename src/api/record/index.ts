import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResult } from '@/decorators'
import { RecordService } from './record.service'
import { RecordPageBody } from './record.dto'
import { RecordEntity } from '@/entities/record.entity'

@ApiTags('record')
@Controller('record')
export class RecordController {
  constructor(private readonly service: RecordService) {}

  @Post('page')
  @ApiBearerAuth()
  @ApiOperation({ summary: '分页列表' })
  @ApiResult({ type: RecordEntity, isPage: true })
  page(@Body() body: RecordPageBody) {
    return this.service.page(body)
  }
}
