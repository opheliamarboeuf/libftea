import { IsOptional, IsString, MaxLength } from 'class-validator';

export class HandleReportDto {
	@IsOptional()
	@IsString()
	@MaxLength(150, { message: 'The title must be 150 characters or less' })
	moderatorMessage?: string;
}
