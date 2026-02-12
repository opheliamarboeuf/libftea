import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
//le jwt-auth.guard
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
	],
	providers: [AuthService, PrismaService, JwtStrategy, JwtAuthGuard],
	exports: [JwtAuthGuard, JwtStrategy, PassportModule],
	controllers: [AuthController],

	exports: [PassportModule, JwtModule]
})

export class AuthModule {}
