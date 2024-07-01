import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  bio?: string;
  links?: string;
  location?: string;
  work?: string;
  skills?: string;
}
