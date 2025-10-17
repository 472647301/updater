import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AdminLoginBody } from './admin.dto'
import { apiUtil } from '@/utils/api'
import { AdminEntity } from '@/entities/admin.entity'
import { AuthService } from '@/auth/auth.service'
import { join } from 'path'
import { existsSync, writeFileSync } from 'fs'

const lockPath = join(__dirname, '../../../public/admin.lock')

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AdminEntity)
    private readonly admin: Repository<AdminEntity>
  ) {}

  async create(body: AdminLoginBody) {
    if (existsSync(lockPath)) apiUtil.error('非法操作')
    const user = await this.admin.findOneBy({
      username: body.username
    })
    if (user) return apiUtil.error('账号已存在')
    const entity = new AdminEntity()
    entity.username = body.username
    entity.password = body.password
    const res = await this.admin.save(entity)
    writeFileSync(lockPath, body.username)
    return apiUtil.data(res)
  }

  async login(body: AdminLoginBody) {
    const user = await this.admin.findOneBy({
      username: body.username
    })
    if (!user) return apiUtil.error('账号不存在')
    if (body.password !== user.password) return apiUtil.error('密码错误')
    const token = await this.authService.signAsync({
      sub: user.id,
      uid: user.id,
      username: user.username
    })
    return apiUtil.data(token)
  }
}
