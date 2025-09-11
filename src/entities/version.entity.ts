import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum PlatformType {
  iOS = 'ios',
  Android = 'android',
  Windows = 'windows',
  Linux = 'linux',
  Mac = 'mac'
}

export enum PackageType {
  /** 热更新包 */
  Hot,
  /** 全量更新包 */
  Install
}

/** 版本表 */
@Entity('versions')
export class VersionEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id'
  })
  id: number

  /** 版本号 */
  @Column('int', {
    name: 'version',
    comment: '版本号'
  })
  version: number

  /** 更新描述 */
  @Column('text', {
    name: 'desc',
    comment: '更新描述',
    nullable: true
  })
  desc: string | null

  /** 应用名称 */
  @Column('varchar', {
    name: 'name',
    comment: '应用名称'
  })
  name: string

  /** 下载链接 */
  @Column('varchar', {
    name: 'download_url',
    comment: '下载链接',
    nullable: true,
    length: 255
  })
  downloadUrl: string | null

  /** 平台 */
  @Column('json', {
    name: 'platform',
    comment: '平台'
  })
  platform: PlatformType[]

  /** 文件大小 */
  @Column('int', {
    name: 'file_size',
    comment: '文件大小',
    nullable: true
  })
  fileSize: number | null

  /** 上传者IP */
  @Column('varchar', {
    name: 'ip',
    comment: 'IP',
    length: 255
  })
  ip: string

  /** 0-热更新包,1-全量更新包 */
  @Column('tinyint', {
    name: 'type',
    comment: '0-热更新包,1-全量更新包',
    default: () => '0'
  })
  type: PackageType

  /** 是否启用 */
  @Column('tinyint', {
    name: 'enable',
    comment: '是否启用',
    default: () => '1'
  })
  enable: number

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
