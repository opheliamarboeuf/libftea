import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// when module starts
	async onModuleInit() {
		// connect to PostgreSQL
		await this.$connect();
		console.log('Prisma connected to database');
	}
	// when modules stops
	async onModuleDestroy() {
		await this.$disconnect();
	}
}
