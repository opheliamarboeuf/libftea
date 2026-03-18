import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

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
			select: { role: true, bannedAt: true },
		});
		
		if (!user || user.bannedAt) {
        	throw new UnauthorizedException('Your account has been banned');
		}
		
		return {
			id: payload.sub,
			username: payload.username,
			role: user?.role || Role.USER,
		};
	}
}
