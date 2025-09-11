import { PackageType, PlatformType } from '@/entities/version.entity'
import { IsString, IsNotEmpty, IsArray } from 'class-validator'
import { OmitType } from '@nestjs/swagger'

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
  /** 平台 */
  @IsArray()
  @IsNotEmpty()
  platform: PlatformType[]

  /** 0-热更新包,1-全量更新包 */
  type?: PackageType
  desc?: string
}

export class VersionCheckEntity {
  id?: number
  desc?: string
  recordId?: number
  downloadUrl?: string
  /** 0-热更新包,1-全量更新包 */
  type?: PackageType
}
