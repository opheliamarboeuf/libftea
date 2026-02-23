import { IsString, IsOptional, MaxLength, IsNotEmpty, IsUrl } from "class-validator";

export class PostsDto {

	@IsString()
	@IsNotEmpty()
	@MaxLength(120, {message: "The title must be 120 characters or less"})
	title: string

	@IsString()
	@IsOptional()
	@MaxLength(500, {message: "The caption must be 500 characters or less"})
	caption?: string

	@IsString()
	@IsOptional()
  	imageUrl?: string;
}

