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

  /** 平台 多平台用逗号拼接 ios,android */
  @Column('varchar', {
    name: '平台 多平台用逗号拼接 ios,android',
    comment: '平台'
  })
  platform: string

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

  /** 渠道 appstore或其它,用于全量更新下发不同的链接 */
  @Column('varchar', {
    name: 'channel',
    comment: '渠道 appstore或其它,用于全量更新下发不同的链接',
    nullable: true,
    length: 255
  })
  channel: string | null

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

  /** 是否强制更新 */
  @Column('tinyint', {
    name: 'is_mandatory',
    comment: '是否强制更新',
    default: () => '1'
  })
  isMandatory: number

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
