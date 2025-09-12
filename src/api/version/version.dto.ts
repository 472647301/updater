import { PackageType, PlatformType } from '@/entities/version.entity'
import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty, OmitType } from '@nestjs/swagger'

export class VersionCheckQuery {
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
}

export class VersionUpadteBody extends OmitType(VersionCheckQuery, [
  'id',
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
