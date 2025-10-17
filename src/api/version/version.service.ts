import { VersionEntity } from '@/entities/version.entity'
import { PackageType } from '@/entities/version.entity'
import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan, Like, EntitySchema } from 'typeorm'
import { FindOptionsWhere, Between, DataSource } from 'typeorm'
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
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(VersionEntity)
    private readonly tVersion: Repository<VersionEntity>
  ) {
    this.updater = new UpdaterUtil(this.configService)
  }

  async page(body: VersionPageBody) {
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
    await this.createTable(body.name)
    const version = body.ver.replace(/\./g, '')
    const entity = new VersionEntity()
    entity.version = Number(version)
    entity.name = body.name
    entity.desc = body.desc ?? null
    entity.downloadUrl = body.downloadUrl
    entity.platform = body.platform
    entity.type = PackageType.Install
    entity.channel = body.channel
    entity.ip = fetchIP(req)
    const res = await this.tVersion.save(entity)
    return apiUtil.data(res)
  }

  async check(_req: Request, body: VersionCheckBody) {
    const version = body.ver.replace(/\./g, '')
    const [hot, install] = await Promise.all([
      this.tVersion.findOne({
        where: {
          type: 0,
          enable: 1,
          name: body.name,
          channel: body.channel,
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
    if (!item) return apiUtil.data({})
    return apiUtil.data({
      id: item.id,
      desc: item.desc,
      isMandatory: item.isMandatory,
      downloadUrl: item.downloadUrl,
      type: item.type
    })
  }

  async failure(req: Request, id: string) {
    const ip = fetchIP(req)
    const ver = await this.tVersion.findOneBy({
      id: Number(id)
    })
    if (!ver) return apiUtil.data('资源不存在')
    const entity = this.createEntity(ver.name)
    const repository = this.dataSource.getRepository(entity)
    return repository.manager.create(entity, {
      username: req.body.username,
      device_id: req.body.device_id,
      result: req.body.result ?? 'none',
      extras: req.body.extras,
      version_id: ver.id,
      ip: ip
    })
  }

  async upload(
    req: Request,
    file: Express.Multer.File,
    body: VersionUpadteBody
  ) {
    let downloadUrl = ''
    const version = body.ver.replace(/\./g, '')
    const dir = `${body.name}/${version}`
    try {
      downloadUrl = await this.updater?.put(dir, file)
    } catch (err) {
      return apiUtil.error(err)
    }
    await this.createTable(body.name)
    const entity = new VersionEntity()
    entity.version = Number(version)
    entity.name = body.name
    entity.desc = body.desc ?? null
    entity.downloadUrl = downloadUrl
    entity.platform = body.platform
    entity.isMandatory = body.isMandatory ? Number(body.isMandatory) : 1
    entity.channel = body.channel
    entity.type = PackageType.Hot
    entity.fileSize = file.size
    entity.ip = fetchIP(req)
    const res = await this.tVersion.save(entity)
    return apiUtil.data(res)
  }

  private async checkTableExists(
    tableName: string,
    schemaName?: string
  ): Promise<boolean> {
    const entity = this.createEntity(tableName)
    const repository = this.dataSource.getRepository(entity)
    let query: string
    if (schemaName) {
      query = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = '${schemaName}' AND table_name = '${tableName}')`
    } else {
      // For databases like MySQL, where schema is often the database name, or if not explicitly using schemas
      query = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`
    }
    const result: { exists: boolean }[] = await repository.manager.query(query)
    return result[0].exists
  }

  private createEntity(tableName: string) {
    return new EntitySchema({
      name: tableName.replace(/\W/g, '_'),
      columns: {
        id: {
          type: 'int',
          primary: true,
          generated: true
        },
        result: {
          type: 'varchar'
        },
        username: {
          type: 'varchar',
          nullable: true
        },
        device_id: {
          type: 'varchar',
          nullable: true
        },
        version_id: {
          type: 'int'
        },
        extras: {
          type: 'json',
          nullable: true
        },
        ip: {
          type: 'varchar',
          nullable: true
        }
      }
    })
  }

  private async createTable(tableName: string) {
    const isExists = await this.checkTableExists(tableName)
    if (isExists) return
    const entity = this.createEntity(tableName)
    const dataSource = this.dataSource.setOptions({
      entities: [entity]
    })
    dataSource.getMetadata(entity).build()
    const schemaBuilder = dataSource.driver.createSchemaBuilder()
    await schemaBuilder.build()
  }
}
