import { RecordEntity, UpdateStatus } from '@/entities/record.entity'
import { VersionEntity } from '@/entities/version.entity'
import { PackageType } from '@/entities/version.entity'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan, Like, FindOptionsWhere, Between } from 'typeorm'
import { Request } from 'express'
import { VersionCheckBody, VersionUpadteBody } from './version.dto'
import { VersionPageBody, VersionCreateBody } from './version.dto'
import { fetchIP } from '@/utils/utils'
import { apiUtil } from '@/utils/api'
import { ConfigService } from '@nestjs/config'
import { UpdaterUtil } from '@/utils/updater'

@Injectable()
export class VersionService {
  private updater?: UpdaterUtil
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RecordEntity)
    private readonly tRecord: Repository<RecordEntity>,
    @InjectRepository(VersionEntity)
    private readonly tVersion: Repository<VersionEntity>
  ) {
    this.updater = new UpdaterUtil(configService)
  }

  async page(req: Request, body: VersionPageBody) {
    const ips = this.configService.get<string>('WHITELIST_IP')?.split(',') ?? []
    if (!ips.includes(fetchIP(req))) return apiUtil.data(null)
    const take = Number(body.pageSize || 20)
    const current = Number(body.current || 1)
    const skip = take * (current - 1)
    const where: FindOptionsWhere<VersionEntity> = {}
    if (body.createTime && body.createTime.length === 2) {
      where.createTime = Between(body.createTime[0], body.createTime[1])
    }
    if (body.updateTime && body.updateTime.length === 2) {
      where.updateTime = Between(body.updateTime[0], body.updateTime[1])
    }
    if (body.ip) where.ip = body.ip
    if (typeof body.type === 'number') where.type = body.type
    if (typeof body.enable === 'number') where.enable = body.enable
    if (typeof body.isMandatory === 'number')
      where.isMandatory = body.isMandatory
    if (body.platform) where.platform = body.platform
    if (body.desc) where.desc = Like(`%${body.desc}%`)
    if (body.channel) where.channel = body.channel
    if (body.version) where.version = body.version
    if (body.name) where.name = body.name
    if (body.ip) where.ip = Like(`%${body.ip}%`)
    const [list, total] = await this.tVersion.findAndCount({
      take: take,
      skip: skip,
      where: where,
      order: body.order ?? { id: 'DESC' }
    })
    return apiUtil.page(list, total)
  }

  async create(req: Request, body: VersionCreateBody) {
    const ips = this.configService.get<string>('WHITELIST_IP')?.split(',') ?? []
    if (!ips.includes(fetchIP(req))) return apiUtil.data(null)
    const version = body.ver.replace(/\./g, '')
    const entity = new VersionEntity()
    entity.version = Number(version)
    entity.name = body.name
    entity.desc = body.desc ?? null
    entity.downloadUrl = body.downloadUrl
    entity.platform = body.platform
    entity.type = PackageType.Install
    entity.ip = fetchIP(req)
    const res = await this.tVersion.save(entity)
    return apiUtil.data(res)
  }

  async check(req: Request, body: VersionCheckBody) {
    const version = body.ver.replace(/\./g, '')
    const [hot, install] = await Promise.all([
      this.tVersion.findOne({
        where: {
          type: 0,
          enable: 1,
          name: body.name,
          version: Number(version),
          platform: Like(`%${body.platform}%`),
          id: body.id ? MoreThan(body.id) : undefined
        },
        order: { id: 'DESC' }
      }),
      this.tVersion.findOne({
        where: {
          type: 1,
          enable: 1,
          name: body.name,
          channel: body.channel,
          version: MoreThan(Number(version)),
          platform: Like(`%${body.platform}%`)
        },
        order: { id: 'DESC' }
      })
    ])

    const item = install || hot
    const record = new RecordEntity()
    const extras = body.extras
    delete body.extras
    record.request = body
    record.response = item
    record.extras = extras
    record.versionId = item?.id ?? null
    record.status = item ? UpdateStatus.Success : UpdateStatus.None
    record.ip = fetchIP(req)
    const entity = await this.tRecord.save(record)

    return apiUtil.data({
      id: item?.id,
      desc: item?.desc,
      recordId: entity.id,
      isMandatory: item?.isMandatory,
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
    entity.error = req.body.error ?? null
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
    const version = body.ver.replace(/\./g, '')
    const dir = `${body.name}/${version}`
    try {
      downloadUrl = await this.updater?.put(dir, file)
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST)
    }
    const entity = new VersionEntity()
    entity.version = Number(version)
    entity.name = body.name
    entity.desc = body.desc ?? null
    entity.downloadUrl = downloadUrl
    entity.platform = body.platform
    entity.isMandatory = body.isMandatory ? Number(body.isMandatory) : 1
    entity.type = PackageType.Hot
    entity.fileSize = file.size
    entity.ip = fetchIP(req)
    const res = await this.tVersion.save(entity)
    return apiUtil.data(res)
  }
}
