import { IsString, IsOptional, MaxLength, IsNotEmpty } from "class-validator";

export class PostDto {
@IsString()
@IsNotEmpty()
@MaxLength(120)
title: string

@IsString()
@IsOptional()
caption?: string
}