import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  MONGODB_URI: Joi.string().uri().required().messages({
    'string.uri':
      'MONGODB_URI deve ser uma URI válida (ex: mongodb://localhost:27017/eventhub)',
    'any.required': 'MONGODB_URI é obrigatório',
  }),

  REDIS_URL: Joi.string().uri().required().messages({
    'string.uri':
      'REDIS_URL deve ser uma URI válida (ex: redis://localhost:6379)',
    'any.required': 'REDIS_URL é obrigatório',
  }),

  JWT_SECRET: Joi.string().min(16).required().messages({
    'string.min': 'JWT_SECRET deve ter no mínimo 16 caracteres',
    'any.required': 'JWT_SECRET é obrigatório',
  }),

  JWT_EXPIRES_IN: Joi.string().default('1d'),

  CACHE_TTL_SECONDS: Joi.number().min(1).default(60),
});
