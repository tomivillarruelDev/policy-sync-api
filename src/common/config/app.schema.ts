import * as Joi from 'joi';

export const JoiValidation = Joi.object({
  HOST_API: Joi.string().default('localhost'),
  JWT_SECRET: Joi.string().default('secret'),
  STAGE: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().default('root'),
  DB_NAME: Joi.string().default('NEST_BACKEND'),
});
