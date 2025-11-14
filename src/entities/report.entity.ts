import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CreateDateColumn } from 'typeorm'

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id'
  })
  id: number

  /** 错误详情 */
  @Column('text', {
    name: 'error',
    comment: '错误详情',
    nullable: true
  })
  error: string | null

  /** 用户名 */
  @Column('varchar', {
    name: 'username',
    comment: '用户名',
    nullable: true
  })
  username: string | null

  /** 热更新版本号 */
  @Column('int', {
    name: 'current_version',
    comment: '热更新版本号',
    nullable: true
  })
  currentVersion: number | null

  /** 平台 ios,android */
  @Column('varchar', {
    name: 'platform',
    comment: '平台',
    nullable: true
  })
  platform: string | null

  /** 当前版本 */
  @Column('varchar', {
    name: 'version',
    comment: '当前版本',
    nullable: true,
    length: 255
  })
  version: string | null

  /** 构建标识 */
  @Column('int', {
    name: 'build_number',
    comment: '构建标识',
    nullable: true
  })
  buildNumber: number | null

  /** 上传者IP */
  @Column('varchar', {
    name: 'ip',
    comment: 'IP',
    length: 255
  })
  ip: string

  /** 扩展信息 */
  @Column('text', {
    name: 'extras',
    comment: '扩展信息',
    nullable: true
  })
  extras: string | null

  /** 创建时间 */
  @CreateDateColumn({
    name: 'create_time',
    comment: '创建时间'
  })
  createTime: Date
}
