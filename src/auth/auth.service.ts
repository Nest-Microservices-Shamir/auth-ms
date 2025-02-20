import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IUser } from 'src/interfaces';
import { JwtService } from '@nestjs/jwt';
import { envs, NATS_SERVICE } from 'src/config';

@Injectable()
export class AuthService {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials return user info
   */
  async validateCredentials(authLoginDto: AuthLoginDto) {
    const userQuery = await firstValueFrom(
      this.client.send(
        { cmd: 'user.find_by_email_with_password' },
        { email: authLoginDto.email },
      ),
    );

    if (!userQuery){
      throw new RpcException({status: HttpStatus.BAD_REQUEST, message: 'Wrong email'});
    }

    const passwordMatches = await this.verifyData(
      userQuery.password,
      authLoginDto.password,
    );

    if (!passwordMatches)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Password is incorrect',
      });

    return userQuery && passwordMatches ? userQuery : null;
  }

  /**
   * generate new token for a user
   */
  generateJwtToken = async (user: Partial<IUser>) => await this.getTokens(user);

  /**
   * Save a new user
   */
  async registerUser(authRegisterDto: AuthRegisterDto) {
    const userQuery = await firstValueFrom(
      this.client.send(
        { cmd: 'user.find_by_email' },
        { email: authRegisterDto.email },
      ),
    );

    if (userQuery) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Email: ${authRegisterDto.email} has already been registered`,
      });
    }

    //TRANSFORMACION DEL PASSWORD
    const hashPassword = await this.hashData(authRegisterDto.password);

    const userCreate: IUser = await firstValueFrom(
      this.client.send(
        { cmd: 'user.create_new_user' },
        { ...authRegisterDto, password: hashPassword },
      ),
    );

    if (!userCreate) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error Registering User Try Again',
      });
    }

    const { password:___, ...rest } = userCreate;

    return rest;
  }

  /**
   * Data encrypt
   */
  hashData = (data: string) => argon2.hash(data);

  /**
   * Verify the authenticity of an encrypted string with an unauthenticated one
   */
  verifyData = (stringHash: string, stringPlain: string): Promise<boolean> =>
    argon2.verify(stringHash, stringPlain);

  /**
   * Access token generator and refresh token
   */
  getTokens = async (
    user: Partial<IUser>,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: envs.jwtAccesTokenLifetime,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: envs.jwtRefreshTokenLifetime,
      }),
    ]);

    return { accessToken, refreshToken };
  };

  /**
   * Validate jwt token validity
   */
  validateJwtToken = (token: string): Promise<any> => {
    try {
      return this.jwtService.verify(token);  
    } catch (error) {
      throw new RpcException({status: HttpStatus.UNAUTHORIZED, message: 'Invalid Token'});
    }
    
  }
}
