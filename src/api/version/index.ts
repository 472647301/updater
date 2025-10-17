import { Body, Controller, Param, Post } from '@nestjs/common'
import { Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { VersionService } from './version.service'
import { ApiResult, Public } from '@/decorators'
import { VersionCheckBody, VersionPageBody } from './version.dto'
import { VersionCheckEntity, VersionUpadteBody } from './version.dto'
import { VersionCreateBody } from './version.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { VersionEntity } from '@/entities/version.entity'

@ApiTags('version')
@Controller('version')
export class VersionController {
  constructor(private readonly service: VersionService) {}

  @Post('page')
  @ApiBearerAuth()
  @ApiOperation({ summary: '分页列表' })
  @ApiResult({ type: VersionEntity, isPage: true })
  page(@Body() body: VersionPageBody) {
    return this.service.page(body)
  }

  @Public()
  @Post('check')
  @ApiOperation({ summary: '检查更新' })
  @ApiResult({ type: VersionCheckEntity })
  check(@Req() req: Request, @Body() body: VersionCheckBody) {
    return this.service.check(req, body)
  }

  @Public()
  @Post('failure/:id')
  @ApiOperation({ summary: '上报更新状态' })
  @ApiResult({ type: String })
  failure(@Req() req: Request, @Param('id') id: string) {
    return this.service.failure(req, id)
  }

  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建更新版本' })
  @ApiResult({ type: VersionEntity })
  create(@Req() req: Request, @Body() body: VersionCreateBody) {
    return this.service.create(req, body)
  }

  @Post('upload')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传更新资源' })
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
