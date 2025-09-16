import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum UpdateStatus {
  /** 更新成功 */
  Success,
  /** 更新失败 */
  Failure,
  /** 无需更新 */
  None
}

/** 记录表 */
@Entity('records')
export class RecordEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id'
  })
  id: number

  /** 版本ID */
  @Column('int', {
    name: 'version_id',
    comment: '版本ID',
    nullable: true
  })
  versionId: number | null

  /** 请求参数 */
  @Column('json', {
    name: 'request',
    comment: '请求参数',
    nullable: true
  })
  request: Record<string, any> | null

  /** 响应结果 */
  @Column('json', {
    name: 'response',
    comment: '响应结果',
    nullable: true
  })
  response: Record<string, any> | null

  /** 额外信息 */
  @Column('json', {
    name: 'extras',
    comment: '额外信息',
    nullable: true
  })
  extras: Record<string, any> | null

  /** 安装失败信息 */
  @Column('text', {
    name: 'error',
    comment: '安装失败信息',
    nullable: true
  })
  error: string | null

  /** IP */
  @Column('varchar', {
    name: 'ip',
    comment: 'IP',
    length: 255
  })
  ip: string

  /** 0-已更新,1-更新失败,2-无需更新 */
  @Column('tinyint', {
    name: 'status',
    comment: '0-已更新,1-更新失败,2-无需更新',
    default: () => '0'
  })
  status: UpdateStatus

  /** 更新时间 */
  @UpdateDateColumn({
    name: 'update_time',
    comment: '更新时间'
  })
  updateTime: Date

  /** 创建时间 */
  @CreateDateColumn({
    name: 'create_time',
    comment: '创建时间'
  })
  createTime: Date
}
