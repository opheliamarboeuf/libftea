import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterDto {
	@IsEmail({}, { message: 'Please enter a valid email address' })
	email: string;

	@IsString()
	@MinLength(3)
	username: string;

	@IsString()
	@IsStrongPassword()
	password: string;
}
