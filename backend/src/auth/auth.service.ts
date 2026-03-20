import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private mailService: MailService,
	) {}

	async register(dto: RegisterDto) {
		const hashedPassword = await bcrypt.hash(dto.password, 10);

		try {
			console.log('Creating user with data:', { email: dto.email, username: dto.username });
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					username: dto.username,
					password: hashedPassword,
					profile: {
						create: {
							bio: '',
							displayName: '',
							avatarUrl: '/assets/default/default-avatar.jpeg',
							coverUrl: '/assets/default/default-cover.jpeg',
						},
					},
				},
				include: {
					profile: true,
				},
			});
			console.log('User created successfully:', user.id);

			return this.generateToken(user.id, user.role, user.username);
		} catch (error) {
			console.error('Error during registration:', error);
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

		if (user.bannedAt) {
			throw new UnauthorizedException('Your account has been banned');
		}

		// if 2FA is enabled, generate a 6 figures code
		if (user.twoFactorEnabled) {
			const code = Math.floor(100000 + Math.random() * 900000).toString();
			const expires = new Date(Date.now() + 10 * 60 * 1000);

			await this.prisma.user.update({
				where: { id: user.id },
				data: { twoFactorCode: code, twoFactorExpires: expires },
			});

			await this.mailService.send2FACode(user.email, user.username, code);

			return { twoFactorRequired: true, userId: user.id };
		}

		return this.generateToken(user.id, user.role, user.username);
	}

	// Generates a JWT access token for the given user ID.
	// The token payload contains the user ID under the "sub" claim, and it is signed with the JWT secret.
	// The returned token can be used by the client to authenticate future requests.
	generateToken(userId: number, role: Role, username: string) {
		const payload = {
			sub: userId,
			role: role,
			username: username,
		};

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async verify2FA(userId: number, code: string) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } });

		if (!user) throw new UnauthorizedException('User not found');

		if (user.bannedAt) {
			throw new UnauthorizedException('Your account has been banned');
		}

		if (!user.twoFactorCode || !user.twoFactorExpires) {
			throw new UnauthorizedException('No 2FA pending');
		}
		if (new Date() > user.twoFactorExpires) {
			throw new UnauthorizedException('Code expired');
		}
		if (user.twoFactorCode !== code) {
			throw new UnauthorizedException('Invalid code');
		}

		// Clean the code after the user used it
		await this.prisma.user.update({
			where: { id: user.id },
			data: { twoFactorCode: null, twoFactorExpires: null },
		});

		return this.generateToken(user.id, user.role, user.username);
	}

	async change2FASettings(userId: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!user) {
				throw new UnauthorizedException('User not found');
			}

			if (user.bannedAt) {
				throw new UnauthorizedException('Banned users cannot change their security settings');
			}
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: { twoFactorEnabled: !user.twoFactorEnabled },
			});

			return updatedUser;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				throw new BadRequestException('Error while updating 2FA settings');
			}
			throw error;
		}
	}

	async getMe(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				twoFactorEnabled: true,
				username: true,
				createdAt: true,
				bannedAt: true,
				role: true,
				profile: {
					select: {
						bio: true,
						displayName: true,
						avatarUrl: true,
						coverUrl: true,
					},
				},
				posts: {
					select: {
						title: true,
						caption: true,
						imageUrl: true,
						createdAt: true,
						updatedAt: true,
					},
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		if (!user || user.bannedAt) {
			throw new UnauthorizedException('Your account has been banned');
		}

		// Fetch friends (accepted friendships)
		const friendships = await this.prisma.friendship.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [{ requesterId: userId }, { addresseId: userId }],
			},
			include: {
				requester: {
					select: {
						id: true,
						username: true,
						role: true,
						bannedAt: true,
						profile: { select: { avatarUrl: true } },
					},
				},
				addresse: {
					select: {
						id: true,
						username: true,
						role: true,
						bannedAt: true,
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
				role: friend.role,
				bannedAt: friend.bannedAt,
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
						bannedAt: true,
						profile: { select: { avatarUrl: true } },
					},
				},
			},
		});

		const pendingRequests = pendingFriendships.map((f) => ({
			id: f.requester.id,
			username: f.requester.username,
			bannedAt: f.requester.bannedAt,
			avatarUrl: f.requester.profile?.avatarUrl,
		}));

		const blocked = await this.prisma.friendship.findMany({
			where: {
				status: 'BLOCKED',
				requesterId: userId,
			},
			include: {
				addresse: {
					select: {
						id: true,
						username: true,
						bannedAt: true,
						profile: {
							select: { avatarUrl: true },
						},
					},
				},
			},
		});

		const blockedUsers = blocked.map((f) => ({
			id: f.addresse.id,
			username: f.addresse.username,
			bannedAt: f.addresse.bannedAt,
			avatarUrl: f.addresse.profile?.avatarUrl,
		}));

		return {
			...user,
			friends,
			pendingRequests,
			blockedUsers,
		};
	}
}
