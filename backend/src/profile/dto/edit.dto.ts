import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class EditDto {
	@IsOptional()
	@IsString()
	@MaxLength(30, { message: 'Your name must be 30 characters or less' })
	displayName?: string;

	@IsOptional()
	@IsString()
	@MaxLength(400, { message: 'Your bio must be 400 characters or less' })
	bio?: string;

	@IsOptional()
	@IsString()
	@IsUrl()
	avatarUrl?: string;

	@IsOptional()
	@IsString()
	@IsUrl()
	coverUrl?: string;
}
