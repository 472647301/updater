import { RecordEntity } from '@/entities/record.entity'
import { OmitType, PartialType } from '@nestjs/swagger'
import { FindOptionsOrder } from 'typeorm'

export class RecordPageBody extends PartialType(
  OmitType(RecordEntity, ['createTime', 'updateTime'])
) {
  current?: number
  pageSize?: number
  createTime?: Date[]
  updateTime?: Date[]
  order?: FindOptionsOrder<RecordEntity>
}
