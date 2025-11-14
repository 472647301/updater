import { ReportEntity } from '@/entities/report.entity'
import { OmitType, PartialType } from '@nestjs/swagger'
import { FindOptionsOrder } from 'typeorm'

export class ReportPageBody extends PartialType(
  OmitType(ReportEntity, ['createTime'])
) {
  current?: number
  pageSize?: number
  createTime?: Date[]
  updateTime?: Date[]
  order?: FindOptionsOrder<ReportEntity>
}

export class ReportErrorEntity {
  id: number
}
