import { IsString, IsOptional, IsUrl, MaxLength } from "class-validator";

export class EditDto {
	@IsOptional()
	@IsString()
	@MaxLength(400)
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
