import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(3)
	username: string;

	@IsString()
	@IsStrongPassword()
	password: string;
}
