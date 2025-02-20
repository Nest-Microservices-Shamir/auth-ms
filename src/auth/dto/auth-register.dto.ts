import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class AuthRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
