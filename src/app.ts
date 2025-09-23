import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseLogger } from './utils/logs'
import { join } from 'path'
import { RecordModule } from './api/record/record.module'
import { VersionModule } from './api/version/version.module'
import { AdminModule } from './api/admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('ORM_HOST'),
        port: configService.get('ORM_PORT'),
        username: configService.get('ORM_USERNAME'),
        password: configService.get('ORM_PASSWORD'),
        database: configService.get('ORM_DATABASE'),
        entities: [join(__dirname, './entities', '*.{ts,js}')],
        logger: new DatabaseLogger(),
        synchronize: false
      }),
      inject: [ConfigService]
    }),
    AdminModule,
    RecordModule,
    VersionModule
  ],
  controllers: []
})
export class AppModule {}
