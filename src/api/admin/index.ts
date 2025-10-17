import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResult, Public } from '@/decorators'
import { AdminService } from './admin.service'
import { AdminLoginBody } from './admin.dto'

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Public()
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员创建' })
  @ApiResult({ type: String })
  create(@Body() body: AdminLoginBody) {
    return this.service.create(body)
  }

  @Public()
  @Post('login')
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员登录' })
  @ApiResult({ type: String })
  login(@Body() body: AdminLoginBody) {
    return this.service.login(body)
  }
}
