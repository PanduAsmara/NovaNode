import { IsArray, IsIP, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

/**
 * Bulk import allocations for a node, e.g. a port range.
 * `ports` is an explicit list of ports to create against the given IP.
 */
export class BulkAllocationDto {
  @IsUUID()
  nodeId: string;

  @IsIP()
  ip: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(65535, { each: true })
  ports: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];
}
