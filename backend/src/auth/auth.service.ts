
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
							avatarUrl: "/assets/default/default-avatar.jpeg",
							coverUrl: "/assets/default/default-cover.jpeg",
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
		const user = await this.prisma.user.findUnique({
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
						displayName: true,
						avatarUrl: true,
						coverUrl: true,
					},
				},
			},
		});

		// Fetch friends (accepted friendships)
		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{ requesterId: userId },
					{ addresseId: userId },
				],
			},
			include: {
				requester: {
					select: {
						id: true,
						username: true,
						profile: { select: { avatarUrl: true } },
					},
				},
				addresse: {
					select: {
						id: true,
						username: true,
						profile: { select: { avatarUrl: true } },
					},
				},
			},
		});

		const friends = friendships.map((f) => {
			const friend = f.requesterId === userId ? f.addresse : f.requester;
			return {
				id: friend.id,
				username: friend.username,
				avatarUrl: friend.profile?.avatarUrl,
			};
		});

		// Fetch pending friend requests (where user is the addressee)
		const pendingFriendships = await this.prisma.friendship.findMany({
			where: {
				status: 'PENDING',
				addresseId: userId,
			},
			include: {
				requester: {
					select: {
						id: true,
						username: true,
						profile: { select: { avatarUrl: true } },
					},
				},
			},
		});

		const pendingRequests = pendingFriendships.map((f) => ({
			id: f.requester.id,
			username: f.requester.username,
			avatarUrl: f.requester.profile?.avatarUrl,
		}));

		return {
			...user,
			friends,
			pendingRequests,
		};
	}
}
