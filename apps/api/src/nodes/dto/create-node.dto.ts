import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { SshAuthType } from '@novanode/shared';

export class CreateNodeDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  fqdn: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  token?: string;

  // --- SSH connection (used by installer / wings / monitoring) ---

  @IsOptional()
  @IsString()
  sshHost?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  sshPort?: number;

  @IsOptional()
  @IsString()
  sshUser?: string;

  @IsOptional()
  @IsEnum(SshAuthType)
  sshAuthType?: SshAuthType;

  /** Plaintext password or private key; encrypted at rest by the service. */
  @IsOptional()
  @IsString()
  sshSecret?: string;
}
