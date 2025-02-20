import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('Main');

  const app = await NestFactory.createMicroservice(
    AppModule, 
    {
      transport: Transport.NATS, options: {
        servers: envs.natsServers
      }
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen();
  logger.log(`Auth Microservice running on port: ${ envs.port }`)
}
bootstrap();
