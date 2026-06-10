import { IsString, IsUrl, MinLength } from 'class-validator';

export class SetConfigDto {
  @IsUrl({ require_tld: false, require_protocol: true })
  baseUrl: string;

  @IsString()
  @MinLength(8)
  apiKey: string;
}
