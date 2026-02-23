import { IsString, IsOptional, MaxLength, IsNotEmpty } from "class-validator";

export class PostsDto {
@IsString()
@IsNotEmpty()
@MaxLength(120)
title: string

@IsString()
@IsOptional()
@MaxLength(500)
caption?: string
}