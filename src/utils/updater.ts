import { ConfigService } from '@nestjs/config'
import * as AliOSS from 'ali-oss'
import { join } from 'path'
import { to } from './utils'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { Logs } from './logs'

export class UpdaterUtil {
  private oss?: AliOSS
  constructor(private readonly configService: ConfigService) {
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

  async put(dir: string, file: Express.Multer.File) {
    const filrName = `${Date.now()}.${file.originalname.split('.').pop()}`
    if (this.oss) {
      const ossDir = this.configService.get('OSS_DIR') || ''
      const ossUrl = this.configService.get('OSS_URL') || ''
      const ossPath = join(ossDir, dir, filrName)
      const [err, res] = await to(
        this.oss.put(ossPath, file.buffer, { timeout: 600000 })
      )
      if (res?.res.status !== 200) {
        Logs.err.error(err ?? res)
        throw err
      }
      return `${ossUrl}/${ossPath}`
    }
    try {
      const localDir = join(__dirname, `../../public/files/${dir}`)
      if (!existsSync(localDir)) {
        mkdirSync(localDir, { recursive: true })
      }
      writeFileSync(`${localDir}/${filrName}`, file.buffer as never)
      return `/${dir}/${filrName}`
    } catch (err) {
      throw err
    }
  }
}
