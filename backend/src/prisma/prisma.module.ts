import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Prisma is available throughout the entire app without needing to import it in every other module
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
