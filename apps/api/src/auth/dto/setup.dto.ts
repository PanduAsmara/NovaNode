import { IsEmail, IsString, MinLength } from 'class-validator';

/** Payload for the first-run Setup Wizard. Creates the OWNER account. */
export class SetupDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
