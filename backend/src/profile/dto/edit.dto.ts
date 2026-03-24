import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class EditDto {
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
