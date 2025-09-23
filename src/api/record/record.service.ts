import { RecordEntity } from '@/entities/record.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm'
import { RecordPageBody } from './record.dto'
import { apiUtil } from '@/utils/api'

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly tRecord: Repository<RecordEntity>
  ) {}

  async page(body: RecordPageBody) {
    const take = Number(body.pageSize || 20)
    const current = Number(body.current || 1)
    const skip = take * (current - 1)
    const where: FindOptionsWhere<RecordEntity> = {}
    if (body.createTime && body.createTime.length === 2) {
      where.createTime = Between(body.createTime[0], body.createTime[1])
    }
    if (body.updateTime && body.updateTime.length === 2) {
      where.updateTime = Between(body.updateTime[0], body.updateTime[1])
    }
    if (body.ip) where.ip = body.ip
    if (typeof body.status === 'number') where.status = body.status
    if (typeof body.versionId === 'number') where.versionId = body.versionId
    if (body.request) where.request = Like(`%${body.request}%`)
    if (body.response) where.response = Like(`%${body.response}%`)
    if (body.extras) where.extras = Like(`%${body.extras}%`)
    const [list, total] = await this.tRecord.findAndCount({
      take: take,
      skip: skip,
      where: where,
      order: body.order ?? { id: 'DESC' }
    })
    return apiUtil.page(list, total)
  }
}
