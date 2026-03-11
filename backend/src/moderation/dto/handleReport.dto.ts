import { IsOptional, IsString, MaxLength } from "class-validator";

export class HandleReportDto {
	@IsOptional()
	@IsString()
	@MaxLength(200, {message: "The title must be 200 characters or less"})
	moderatorMessage?: string;
}