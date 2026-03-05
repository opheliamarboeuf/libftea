import { IsString, IsOptional, MaxLength, IsEnum } from "class-validator";

export enum ReportType {
	SPAM = "SPAM",
	HARASSMENT = "HARASSMENT",
	INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
	OTHER = "OTHER",
}
export class ReportPostDto {
	@IsEnum(ReportType, { message: "Reason must be a valid report type" })
	reason: ReportType;

	@IsString()
	@IsOptional()
	@MaxLength(350, {message: "The caption must be 350 characters or less"})
	context?: string
}