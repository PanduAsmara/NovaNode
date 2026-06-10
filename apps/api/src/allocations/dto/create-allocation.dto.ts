import { IsInt, IsIP, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateAllocationDto {
  @IsUUID()
  nodeId: string;

  @IsIP()
  ip: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsOptional()
  @IsString()
  alias?: string;
}
