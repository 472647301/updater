import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Between, Repository } from 'typeorm'
import { Request } from 'express'
import { fetchIP } from '@/utils/utils'
import { apiUtil } from '@/utils/api'
import { ReportEntity } from '@/entities/report.entity'
import { ReportPageBody } from './report.dto'

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly tReport: Repository<ReportEntity>
  ) {}

  async page(body: ReportPageBody) {
    const take = Number(body.pageSize || 20)
    const current = Number(body.current || 1)
    const skip = take * (current - 1)
    const where: FindOptionsWhere<ReportEntity> = {}
    if (body.createTime && body.createTime.length === 2) {
      where.createTime = Between(body.createTime[0], body.createTime[1])
    }
    if (body.ip) where.ip = body.ip
    if (body.platform) where.platform = body.platform
    if (body.version) where.version = body.version
    const [list, total] = await this.tReport.findAndCount({
      take: take,
      skip: skip,
      where: where,
      order: body.order ?? { id: 'DESC' }
    })
    return apiUtil.page(list, total)
  }

  async error(req: Request) {
    const ip = fetchIP(req)
    const entity = new ReportEntity()
    Object.assign(entity, req.body, { ip })
    await this.tReport.save(entity)
    return apiUtil.data({ id: entity.id })
  }
}
