import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { VersionService } from './version.service'
import { ApiResult } from '@/decorators'
import { VersionCheckQuery, VersionUpadteBody } from './version.dto'
import { VersionCheckEntity } from './version.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { RecordEntity } from '@/entities/record.entity'
import { VersionEntity } from '@/entities/version.entity'

@ApiTags('version')
@Controller('version')
export class VersionController {
  constructor(private readonly service: VersionService) {}

  @Get('check')
  @ApiOperation({ summary: '检查更新' })
  @ApiResult({ type: VersionCheckEntity, status: 200 })
  check(@Req() req: Request, @Query() query: VersionCheckQuery) {
    return this.service.check(req, query)
  }

  @Post('failure/:id')
  @ApiOperation({ summary: '更新失败' })
  @ApiResult({ type: RecordEntity })
  failure(@Req() req: Request, @Param('id') id: string) {
    return this.service.failure(req, id)
  }

  @Post('upload')
  @ApiOperation({ summary: '上传资源' })
  @ApiResult({ type: VersionEntity })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: VersionUpadteBody
  ) {
    return this.service.upload(req, file, body)
  }
}
