import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, Max, Min, validateSync, IsNotEmpty, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number = 5000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  DIRECT_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string;

  @IsString()
  @IsNotEmpty()
  SUPER_ADMIN_SEED_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  SUPER_ADMIN_SEED_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  REVALIDATE_SECRET: string;

  @IsString()
  @IsNotEmpty()
  WEB_REVALIDATE_URL: string;

  @IsString()
  @IsNotEmpty()
  IMAGE_ALLOWED_HOSTS: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT?: number = 2000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
