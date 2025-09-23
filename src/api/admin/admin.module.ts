
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminController } from '.'
import { AuthModule } from '@/auth/auth.module'
import { AdminEntity } from '@/entities/admin.entity'
import { AdminService } from './admin.service'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AdminEntity])],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
