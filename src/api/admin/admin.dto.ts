import { IsNotEmpty, IsString } from 'class-validator'

export class AdminLoginBody {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  password: string
}
