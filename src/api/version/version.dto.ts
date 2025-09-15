import { PackageType, PlatformType } from '@/entities/version.entity'
import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty, OmitType } from '@nestjs/swagger'

export class VersionCheckBody {
  /** 版本号 */
  @IsString()
  @IsNotEmpty()
  ver: string

  /** 应用名称 */
  @IsString()
  @IsNotEmpty()
  name: string

  /** 平台 */
  @IsString()
  @IsNotEmpty()
  platform: PlatformType

  /** 已更新的版本ID */
  id?: number
  /** 渠道 appstore或其它,用于全量更新下发不同的链接 */
  channel?: string
  extras?: any
}

export class VersionUpadteBody extends OmitType(VersionCheckBody, [
  'id',
  'extras',
  'platform'
]) {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any

  @IsString()
  @IsNotEmpty()
  platform: string

  /** 0-热更新包,1-全量更新包 */
  type?: PackageType
  /** 是否强制更新 */
  isMandatory?: number
  desc?: string
  /** appstore直接传入下载链接 */
  downloadUrl?: string
}

export class VersionCheckEntity {
  id?: number
  desc?: string
  recordId?: number
  downloadUrl?: string
  /** 是否强制更新 */
  isMandatory?: number
  /** 0-热更新包,1-全量更新包 */
  type?: PackageType
}
