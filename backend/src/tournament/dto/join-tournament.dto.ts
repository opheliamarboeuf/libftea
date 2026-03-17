import { IsOptional, IsString } from "class-validator";

export class JoinTournamentDto {

	@IsString()
	title: string;

	@IsOptional()
	@IsString()
	caption?: string;
}