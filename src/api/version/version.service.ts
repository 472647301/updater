import { RecordEntity, UpdateStatus } from '@/entities/record.entity'
import { PackageType, VersionEntity } from '@/entities/version.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { MoreThanOrEqual, FindOptionsWhere, In } from 'typeorm'
import { Request } from 'express'
import { VersionCheckQuery, VersionUpadteBody } from './version.dto'
import { fetchIP, to } from '@/utils/utils'
import { apiUtil } from '@/utils/api'
import { ConfigService } from '@nestjs/config'
import AliOSS from 'ali-oss'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

@Injectable()
export class VersionService {
  private oss?: AliOSS
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RecordEntity)
    private readonly tRecord: Repository<RecordEntity>,
    @InjectRepository(VersionEntity)
    private readonly tVersion: Repository<VersionEntity>
  ) {
    const opts = this.fetchOSSOptions()
    if (opts) this.oss = new AliOSS(opts)
  }

  private fetchOSSOptions(): AliOSS.Options | undefined {
    const bucket = this.configService.get<string>('OSS_BUCKER')
    const accessKeyId = this.configService.get<string>('OSS_KEY')
    const accessKeySecret = this.configService.get<string>('OSS_SECRET')
    const region = this.configService.get<string>('OSS_REGION')
    if (bucket && accessKeyId && accessKeySecret && region) {
      return { bucket, accessKeyId, accessKeySecret, region }
    }
  }

  async check(req: Request, query: VersionCheckQuery) {
    const version = query.ver.replaceAll('.', '')
    const where: FindOptionsWhere<VersionEntity> = {
      enable: 1,
      name: query.name,
      platform: In([query.platform]),
      version: MoreThanOrEqual(Number(version))
    }
    if (query.id) where.id = MoreThan(query.id)
    const list = await this.tVersion.find({
      where,
      order: { version: 'DESC', id: 'DESC' }
    })
    const item = list?.[0]
    const record = new RecordEntity()

    record.request = query
    record.response = item
    record.extras = req.body
    record.versionId = item?.id
    record.status = item ? UpdateStatus.Success : UpdateStatus.None
    record.ip = fetchIP(req)
    const entity = await this.tRecord.save(record)

    return apiUtil.data({
      id: item?.id,
      desc: item?.desc,
      recordId: entity.id,
      downloadUrl: item?.downloadUrl,
      type: item?.type
    })
  }

  async failure(req: Request, id: string) {
    const ip = fetchIP(req)
    const entity = await this.tRecord.findOneBy({
      ip: ip,
      status: UpdateStatus.Success,
      id: Number(id)
    })
    if (!entity) return apiUtil.data(null)
    entity.status = UpdateStatus.Failure
    await this.tRecord.save(entity)
    return apiUtil.data(entity)
  }

  async upload(
    req: Request,
    file: Express.Multer.File,
    body: VersionUpadteBody
  ) {
    const ips = this.configService.get<string>('WHITELIST_IP')?.split(',') ?? []
    if (!ips.includes(fetchIP(req))) return apiUtil.data(null)
    let downloadUrl = ''
    const version = body.ver.replaceAll('.', '')
    const dir = `${body.name}/${version}`
    const ossDir = this.configService.get('OSS_DIR') || ''
    const ossDomain = this.configService.get('OSS_DOMAIN') || ''
    if (this.oss) {
      const [err, res] = await to(
        this.oss.put(`${ossDir}${dir}/${file.filename}`, file.buffer)
      )
      if (res?.res.status !== 200) {
        throw new HttpException(err ?? res, HttpStatus.BAD_REQUEST)
      }
      downloadUrl = `${ossDomain}/${ossDir}${dir}/${file.filename}`
    } else {
      const localDir = join(__dirname, `../../../public/${dir}`)
      if (!existsSync(localDir)) {
        mkdirSync(localDir)
      }
      writeFileSync(`${localDir}/${file.filename}`, file.buffer)
      downloadUrl = `${req.baseUrl}/${localDir}/${file.filename}`
    }
    const entity = new VersionEntity()
    entity.version = Number(version)
    entity.name = body.name
    entity.desc = body.desc ?? null
    entity.downloadUrl = downloadUrl
    entity.platform = body.platform
    entity.fileSize = file.size
    entity.ip = fetchIP(req)
    entity.type = body.type ?? PackageType.Hot
    const res = await this.tVersion.save(entity)
    return apiUtil.data(res)
  }
}
