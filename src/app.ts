import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseLogger } from './utils/logs'
import { join } from 'path'
import { RecordModule } from './api/record/record.module'
import { VersionModule } from './api/version/version.module'
// import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager'
// import { APP_INTERCEPTOR } from '@nestjs/core'
// import { CacheableMemory } from 'cacheable'
// import { createKeyv } from '@keyv/redis'
// import { Keyv } from 'keyv'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     const rHost = configService.get('REDIS_HOST')
    //     const rPwd = configService.get('REDIS_PASSWORD')
    //     const rPath = `${rHost}:${configService.get('REDIS_PORT')}`
    //     const rUser = `${configService.get('REDIS_USERNAME')}:${rPwd}`
    //     return {
    //       stores: rHost
    //         ? createKeyv(
    //             rPwd ? `redis://${rUser}@${rPath}` : `redis://${rPath}`
    //           )
    //         : new Keyv({
    //             store: new CacheableMemory({ ttl: 60000, lruSize: 5000 })
    //           }),
    //       ttl: 60000
    //     }
    //   },
    //   inject: [ConfigService]
    // }),
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
    RecordModule,
    VersionModule
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_INTERCEPTOR,
  //     useClass: CacheInterceptor
  //   }
  // ]
})
export class AppModule {}
