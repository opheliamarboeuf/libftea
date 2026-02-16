import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PostService {
	constructor(
		private prisma: PrismaService,
	) {}
	async create(userId:number) {
		return (null);
	}
}