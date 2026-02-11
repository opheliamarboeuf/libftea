// Handles user registration and authentication, including password hashing, JWT generation, and database access via Prisma
// BadRequestException = erreur 400, UnauthorizedException = erreur 401

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const hashedPassword = await bcrypt.hash(dto.password, 10);

		try {
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					username: dto.username,
					password: hashedPassword,
					profile:{
						create:{
							bio: "",
							displayName: "",
							avatarUrl: null,
							coverUrl: null,
						},
					},
				},
				include: {
					profile: true,
				},
			});

			return this.generateToken(user.id);

		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new BadRequestException('Email or username already exists');
				}
			}
			throw error;
		}
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { username: dto.username },
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		const passwordValid = await bcrypt.compare(dto.password, user.password);

		if (!passwordValid) {
			throw new UnauthorizedException('Incorrect password');
		}

		return this.generateToken(user.id);
	}

	// Generates a JWT access token for the given user ID.
	// The token payload contains the user ID under the "sub" claim, and it is signed with the JWT secret.
	// The returned token can be used by the client to authenticate future requests.
	generateToken(userId: number) {
		const payload = { sub: userId };

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async getMe(userId: number) {
		return this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				createdAt: true,
				role: true,
				profile: {
					select: {
						bio:true, 
						avatarUrl: true,
						coverUrl: true,
					},
				},
			},
		});
	}
}
