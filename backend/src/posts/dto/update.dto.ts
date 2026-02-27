import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdatePostDto {

	@IsString()
	@IsOptional()
	@MaxLength(50, {message: "The title must be 65 characters or less"})
	title: string

	@IsString()
	@IsOptional()
	@MaxLength(500, {message: "The caption must be 500 characters or less"})
	caption?: string
}

