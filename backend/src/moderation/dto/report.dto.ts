import { IsString, IsOptional, MaxLength, IsEnum } from "class-validator";

export enum ReportType {
	SPAM = "SPAM",
	HARASSMENT = "HARASSMENT",
	INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
	OTHER = "OTHER",
}
export class ReportDto {
	@IsEnum(ReportType, { message: "Category must be a valid report type" })
	category: ReportType;

	@IsString()
	@IsOptional()
	@MaxLength(250, {message: "The description must be 250 characters or less"})
	description?: string
}