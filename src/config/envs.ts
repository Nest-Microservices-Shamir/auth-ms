import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  //NATS SERVICE
  NATS_SERVERS: string[];
  //JWT
  JWT_SECRET: string;
  JWT_ACCES_TOKEN_LIFETIME: string;
  JWT_REFRESH_TOKEN_LIFETIME: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    JWT_SECRET: joi.string().required(),
    JWT_ACCES_TOKEN_LIFETIME: joi.string().required(),
    JWT_REFRESH_TOKEN_LIFETIME: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  console.error('Config validation error(s):');
  console.log('============================================================');
  error.details.forEach((detail) => {
    console.error(`====>>> ${detail.message}`);
  });
  console.log('============================================================');
  throw new Error('Environment variables validation failed.');
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  //NATS SERVICE
  natsServers: envVars.NATS_SERVERS,
  //JWT
  jwtSecret: envVars.JWT_SECRET,
  jwtAccesTokenLifetime: envVars.JWT_ACCES_TOKEN_LIFETIME,
  jwtRefreshTokenLifetime: envVars.JWT_REFRESH_TOKEN_LIFETIME,
};
