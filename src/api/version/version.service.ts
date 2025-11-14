import { VersionEntity } from '@/entities/version.entity'
import { PackageType } from '@/entities/version.entity'
import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan, Like, Table } from 'typeorm'
import { FindOptionsWhere, Between, DataSource } from 'typeorm'
import { Request } from 'express'
import { VersionCheckBody, VersionFailureBody } from './version.dto'
import { VersionUpadteBody } from './version.dto'
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
    if (body.name) where.name = body.name
    if (body.channel) where.channel = body.channel
    if (body.version) where.version = body.version
    if (body.platform) where.platform = body.platform
    if (body.desc) where.desc = Like(`%${body.desc}%`)
    const [list, total] = await this.tVersion.findAndCount({
      take: take,
      skip: skip,
      where: where,
      order: body.order ?? { id: 'DESC' }
    })
    return apiUtil.page(list, total)
  }

  async create(req: Request, body: VersionCreateBody) {
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
    await this.createTable(body.name)
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

  async failure(req: Request, id: string, body: VersionFailureBody) {
    const ip = fetchIP(req)
    if (!body.result) return apiUtil.data({})
    const ver = await this.tVersion.findOneBy({
      id: Number(id)
    })
    if (!ver) return apiUtil.data('资源不存在')
    const res = await this.updateTable(ver, {
      id: body.id,
      username: body.username,
      device_id: body.deviceId,
      result: body.result,
      extras: body.extras,
      create_time: new Date(),
      update_time: new Date(),
      version_id: ver.id,
      ip: ip
    })
    return apiUtil.data({ rowId: res })
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
    await this.createTable(body.name)
    const res = await this.tVersion.save(entity)
    return apiUtil.data(res)
  }

  private dynamicTable(name: string) {
    const tableName = name.replace(/\W/g, '_')
    return new Table({
      name: tableName,
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment'
        },
        { name: 'version', type: 'int' },
        { name: 'version_id', type: 'int' },
        { name: 'ip', type: 'varchar', isNullable: true },
        { name: 'extras', type: 'json', isNullable: true },
        { name: 'result', type: 'varchar', isNullable: true },
        { name: 'username', type: 'varchar', isNullable: true },
        { name: 'device_id', type: 'varchar', isNullable: true },
        { name: 'update_time', type: 'datetime', isNullable: true },
        { name: 'create_time', type: 'datetime', isNullable: true }
      ]
    })
  }

  private async updateTable(ver: VersionEntity, body: any) {
    const tableName = ver.name.replace(/\W/g, '_')
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    const queryBuilder = queryRunner.manager.createQueryBuilder()
    try {
      let rowId: undefined | number = undefined
      if (body.id) {
        const tableQuery = queryBuilder.update(tableName)
        tableQuery.set({
          result: body.result,
          update_time: new Date()
        })
        tableQuery.where('id = :id', { id: body.id }) // Specify your WHERE clause
        await tableQuery.execute()
      } else {
        const tableQuery = queryBuilder.insert().into(tableName)
        tableQuery.values({
          username: body.username,
          device_id: body.device_id,
          result: body.result,
          extras:
            typeof body.extras !== 'string'
              ? JSON.stringify(body.extras)
              : body.extras,
          create_time: new Date(),
          update_time: new Date(),
          version: ver.version,
          version_id: ver.id,
          ip: body.ip
        })
        const row = await tableQuery.execute()
        rowId = row.raw.insertId
      }
      return rowId
    } catch (error) {
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async createTable(name: string) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    try {
      const table = this.dynamicTable(name)
      await queryRunner.createTable(table, true)
    } catch (error) {
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
