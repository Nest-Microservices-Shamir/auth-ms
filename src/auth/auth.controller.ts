import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { IUser } from 'src/interfaces';

@Controller()
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register' })
  registerUser(@Payload() authRegisterDto: AuthRegisterDto) {
    return this.authService.registerUser(authRegisterDto);
  }

  @MessagePattern({ cmd: 'auth.generate_jwt_token' })
  generateJwtToken(@Payload() verifiedUser: IUser) {
    return this.authService.generateJwtToken(verifiedUser);
  }

  @MessagePattern({ cmd: 'auth.validate_credentials' })
  validateCredentials(@Payload() authLoginDto: AuthLoginDto) {  
    return this.authService.validateCredentials(authLoginDto);
  }

  @MessagePattern({ cmd: 'auth.validate_jwt_token' })
  validateJwtToken(@Payload('token') token: string) {  
    return this.authService.validateJwtToken(token);
  }

}
