import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	async validate(payload: any) {
		// Récupère le role frais depuis la base de données
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			select: { role: true },
		});

		return {
			id: payload.sub,
			username: payload.username,
			role: user?.role || Role.USER,
		};
	}
}
