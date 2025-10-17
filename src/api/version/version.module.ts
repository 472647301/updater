import { VersionEntity } from '@/entities/version.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VersionController } from '.'
import { VersionService } from './version.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([VersionEntity])],
  controllers: [VersionController],
  providers: [VersionService]
})
export class VersionModule {}
