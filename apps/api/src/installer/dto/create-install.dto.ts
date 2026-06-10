import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { type SupportedOS, SUPPORTED_OS, SshAuthType } from '@novanode/shared';

/** Ad-hoc SSH credentials, when targeting a host not registered as a node. */
export class SshCredsDto {
  @IsString()
  host: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsString()
  user: string;

  @IsEnum(SshAuthType)
  authType: SshAuthType;

  /** Plaintext password or private key. */
  @IsString()
  secret: string;
}

export class CreateInstallDto {
  /** Target OS — required (a registered node does not store its OS). */
  @IsIn(SUPPORTED_OS)
  os: SupportedOS;

  /** Either target a registered node by id… */
  @IsOptional()
  @IsUUID()
  nodeId?: string;

  /** …or provide an ad-hoc host + SSH credentials. */
  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SshCredsDto)
  ssh?: SshCredsDto;
}
