import { IsString, IsDate, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTournamentDto {
	@IsString()
	theme: string;

	@Type(() => Date)
	@IsDate()
	startDate: Date;

	@Type(() => Date)
	@IsDate()
	endDate: Date;

	@IsString()
	@IsOptional()
	description?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	maxPlayers?: number;

	@IsString()
	@IsOptional()
	rules?: string;
}
