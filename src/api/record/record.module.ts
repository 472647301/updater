import { RecordEntity } from '@/entities/record.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RecordController } from '.'
import { RecordService } from './record.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([RecordEntity])],
  controllers: [RecordController],
  providers: [RecordService]
})
export class RecordModule {}
