import { PrismaClient, Role, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import sharp from 'sharp';
import { join } from 'path';

const prisma = new PrismaClient();

// -------------------- HELPERS --------------------

const now = new Date();
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const nineDaysAgo = new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000);

function getRandomDate(start: Date, end: Date) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffleArray<T>(array: T[]): T[] {
	return [...array].sort(() => Math.random() - 0.5);
}

// Resize seed images to 500x500
async function ensureSeedImagesResized(username: string, postCount: number) {
	for (let i = 1; i <= postCount; i++) {
		const imagePath = join(process.cwd(), 'uploads/seed', username, `${i}.jpg`);
		const resizedPath = join(process.cwd(), 'uploads/seed', username, `${i}-resized.jpg`);

		try {
			await sharp(imagePath)
				.resize(500, 500, {
					fit: 'cover',
					position: 'center',
				})
				.jpeg({ quality: 85 })
				.toFile(resizedPath);
		} catch (error) {
			console.log(`Could not resize image ${username}/${i}.jpg:`, error);
		}
	}
}

// -------------------- TYPES --------------------

interface ReplyData {
	userId: number;
	content: string;
	createdAt?: Date;
}

interface CommentData {
	userId: number;
	content: string;
	createdAt?: Date;
	reply?: ReplyData;
}

interface PostData {
	title: string;
	caption: string;
	comments: CommentData[];
}

// -------------------- USERS --------------------

async function createUserIfNotExists(
	email: string,
	username: string,
	passwordPlain: string,
	role: Role,
	bio: string,
) {
	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ email }, { username }],
		},
	});

	if (existingUser) {
		console.log(`${username} already exists`);
		return existingUser;
	}

	const hashedPassword = await bcrypt.hash(passwordPlain, 10);

	const user = await prisma.user.create({
		data: {
			email,
			username,
			password: hashedPassword,
			role,
		},
	});

	await prisma.profile.create({
		data: {
			userId: user.id,
			bio,
			avatarUrl: '/assets/default/default-avatar.jpeg',
			coverUrl: '/assets/default/default-cover.jpeg',
		},
	});

	return user;
}

// -------------------- NOTIFICATIONS --------------------

async function createNotification(
	userId: number,
	type: NotificationType,
	metadata: Record<string, string>,
) {
	await prisma.notification.create({
		data: {
			userId,
			type,
			message: '',
			metadata: JSON.stringify(metadata),
			isRead: Math.random() > 0.5,
		},
	});
}

// -------------------- MODERATION LOGS --------------------

async function createModerationLog(
	action: string,
	actorId: number,
	targetUserId?: number,
	targetPostId?: number,
	createdAt?: Date,
) {
	await prisma.moderationLog.create({
		data: {
			action: action as any,
			actorId,
			targetUserId,
			targetPostId,
			createdAt: createdAt || new Date(),
		},
	});
}

// -------------------- POSTS + LIKES --------------------

async function createPostsForUser(
	userId: number,
	username: string,
	postsData: PostData[],
	allUserIds: number[],
) {
	const existingPosts = await prisma.post.count({ where: { authorId: userId } });
	if (existingPosts > 0) return;

	// Fetch all usernames for notifications
	const allUsers = await prisma.user.findMany({
		where: { id: { in: allUserIds } },
		select: { id: true, username: true },
	});
	const usersMap = new Map<number, string>();
	allUsers.forEach((u) => usersMap.set(u.id, u.username));

	await ensureSeedImagesResized(username, postsData.length);

	for (let i = 0; i < postsData.length; i++) {
		const createdAt = getRandomDate(weekAgo, now);

		const post = await prisma.post.create({
			data: {
				title: postsData[i].title,
				caption: postsData[i].caption,
				imageUrl: `/uploads/seed/${username}/${i + 1}-resized.jpg`,
				authorId: userId,
				createdAt,
				updatedAt: createdAt,
			},
		});

		for (const commentData of postsData[i].comments) {
			const commentDate = commentData.createdAt || getRandomDate(createdAt, now);

			const comment = await prisma.comment.create({
				data: {
					content: commentData.content,
					postId: post.id,
					userId: commentData.userId,
					createdAt: commentDate,
				},
			});

			await createNotification(userId, NotificationType.COMMENT, {
				username: usersMap.get(commentData.userId)!,
			});

			if (commentData.reply) {
				const replyDate = commentData.reply.createdAt || getRandomDate(commentDate, now);

				await prisma.comment.create({
					data: {
						content: commentData.reply.content,
						postId: post.id,
						userId: commentData.reply.userId,
						parentId: comment.id,
						createdAt: replyDate,
					},
				});

				await createNotification(commentData.userId, NotificationType.COMMENT_REPLY, {
					username: usersMap.get(commentData.reply.userId)!,
				});
			}
		}

		const shuffled = shuffleArray(allUserIds);
		const likeCount = Math.floor(Math.random() * 6);

		for (const likerId of shuffled.slice(0, likeCount)) {
			if (likerId === userId) continue;

			await prisma.like.create({
				data: {
					userId: likerId,
					postId: post.id,
				},
			});

			await createNotification(userId, NotificationType.LIKE, {
				username: usersMap.get(likerId)!,
			});
		}
	}
}

// -------------------- FRIENDSHIPS --------------------

async function createRandomFriendships(userIds: number[]) {
	// ✅ Récupérer les usernames pour les notifs
	const allUsers = await prisma.user.findMany({
		where: { id: { in: userIds } },
		select: { id: true, username: true },
	});
	const usersMap = new Map<number, string>();
	allUsers.forEach((u) => usersMap.set(u.id, u.username));

	for (const userId of userIds) {
		const candidates = userIds.filter((id) => id !== userId);

		const shuffled = shuffleArray(candidates);

		const targetCount = Math.floor(Math.random() * 3) + 2;

		let created = 0;

		for (const friendId of shuffled) {
			if (created >= targetCount) break;

			const exists = await prisma.friendship.findFirst({
				where: {
					OR: [
						{
							requesterId: userId,
							addresseId: friendId,
						},
						{
							requesterId: friendId,
							addresseId: userId,
						},
					],
				},
			});

			if (exists) continue;

			const status = Math.random() < 0.6 ? 'PENDING' : 'ACCEPTED';

			await prisma.friendship.create({
				data: {
					requesterId: userId,
					addresseId: friendId,
					status,
				},
			});

			if (status === 'PENDING') {
				await createNotification(friendId, NotificationType.FRIEND_REQUEST, {
					username: usersMap.get(userId)!,
				});
			}

			created++;
		}
	}
}

// -------------------- CONVERSATIONS --------------------

async function createConversations(userIds: number[]) {
	for (const userId of userIds) {
		const friendships = await prisma.friendship.findMany({
			where: {
				OR: [
					{ requesterId: userId, status: 'ACCEPTED' },
					{ addresseId: userId, status: 'ACCEPTED' },
				],
			},
		});

		const friendIds = friendships.map((f) =>
			f.requesterId === userId ? f.addresseId : f.requesterId,
		);

		let conversationsCreated = 0;

		for (const friendId of friendIds) {
			if (conversationsCreated >= 2) break;

			const existingConversation = await prisma.conversation.findFirst({
				where: {
					User: {
						every: {
							id: {
								in: [userId, friendId],
							},
						},
					},
				},
			});

			if (existingConversation) continue;

			await prisma.conversation.create({
				data: {
					User: {
						connect: [{ id: userId }, { id: friendId }],
					},
				},
			});

			conversationsCreated++;
		}
	}
}

// -------------------- MESSAGES --------------------

async function createMessages() {
	const conversations = await prisma.conversation.findMany({
		include: {
			User: true,
		},
	});

	const existingMessages = await prisma.message.count();
	if (existingMessages > 0) return;

	const messages = {
		1: {
			first: `What's up?`,
			second: `Nothing much, you?`,
		},
		2: {
			first: `How's your day going?`,
			second: `Pretty good! How about yours?`,
		},
	};

	for (let i = 0; i < conversations.length; i++) {
		const conv = conversations[i];
		const messageType = (i % 2) + 1;
		const selectedMessages = messages[messageType];

		const firstMessageDate = getRandomDate(weekAgo, now);

		const firstSender = conv.User[0];
		await prisma.message.create({
			data: {
				content: selectedMessages.first,
				conversationId: conv.id,
				senderId: firstSender.id,
				createdAt: firstMessageDate,
			},
		});

		const secondSender = conv.User[1];
		await prisma.message.create({
			data: {
				content: selectedMessages.second,
				conversationId: conv.id,
				senderId: secondSender.id,
				createdAt: getRandomDate(firstMessageDate, now),
			},
		});
	}
}

// -------------------- TOURNAMENTS --------------------

async function ensureTournamentImageResized(username: string) {
	const imagePath = join(process.cwd(), 'uploads/seed/tournament', `${username}_tournament.jpg`);
	const resizedPath = join(
		process.cwd(),
		'uploads/seed/tournament',
		`${username}_tournament-resized.jpg`,
	);

	try {
		await sharp(imagePath)
			.resize(500, 500, {
				fit: 'cover',
				position: 'center',
			})
			.jpeg({ quality: 85 })
			.toFile(resizedPath);
	} catch (error) {
		console.log(`Could not resize tournament image ${username}_tournament.jpg:`, error);
	}
}

async function createPostsForTournament(
	userId: number,
	username: string,
	postData: PostData,
	allUserIds: number[],
	forcedLikeCount?: number,
) {
	const postDate = getRandomDate(nineDaysAgo, weekAgo);

	const post = await prisma.post.create({
		data: {
			title: postData.title,
			caption: postData.caption,
			imageUrl: `/uploads/seed/tournament/${username}_tournament-resized.jpg`,
			authorId: userId,
			createdAt: postDate,
			updatedAt: postDate,
		},
	});

	for (const commentData of postData.comments) {
		const commentDate = getRandomDate(postDate, weekAgo);

		const comment = await prisma.comment.create({
			data: {
				content: commentData.content,
				postId: post.id,
				userId: commentData.userId,
				createdAt: commentDate,
			},
		});

		if (commentData.reply) {
			const replyDate = getRandomDate(commentDate, weekAgo);

			await prisma.comment.create({
				data: {
					content: commentData.reply.content,
					postId: post.id,
					userId: commentData.reply.userId,
					parentId: comment.id,
					createdAt: replyDate,
				},
			});
		}
	}

	const shuffled = shuffleArray(allUserIds);
	const likeCount = forcedLikeCount ?? Math.floor(Math.random() * 6);

	for (const likerId of shuffled.slice(0, likeCount)) {
		if (likerId === userId) continue;

		await prisma.like.create({
			data: {
				userId: likerId,
				postId: post.id,
			},
		});
	}

	return post;
}

async function createReports(
	toxicUser: any,
	userIds: number[],
	harassmentPost: any,
	inappropriatePost: any,
	modUser: any,
) {
	const harassmentDescriptions = [
		'This feels like direct harassment toward a specific person.',
		'Clearly targeted and aggressive tone.',
	];

	const inappropriateDescriptions = [
		'This content is inappropriate and uncomfortable.',
		'Does not respect community standards.',
	];

	const allReporters = shuffleArray(userIds.filter((id) => id !== toxicUser.id));
	const harassmentReporters = allReporters.slice(0, 2);
	const inappropriateReporters = allReporters.slice(2, 4);

	let lastReportDate = harassmentPost.createdAt;
	let harassmentHandledAt: Date | undefined;

	// ---------------- HARASSMENT POST REPORT ----------------
	for (let i = 0; i < harassmentReporters.length; i++) {
		const existing = await prisma.report.findFirst({
			where: {
				reporterId: harassmentReporters[i],
				reportedPostId: harassmentPost.id,
			},
		});
		if (existing) continue;

		const reportDate = getRandomDate(harassmentPost.createdAt, now);
		lastReportDate = reportDate;

		harassmentHandledAt = getRandomDate(reportDate, now);
		await prisma.report.create({
			data: {
				reporterId: harassmentReporters[i],
				reportedPostId: harassmentPost.id,
				reportedUserId: null,
				reportCategory: 'HARASSMENT',
				reportDescription: harassmentDescriptions[i % harassmentDescriptions.length],
				status: 'ACCEPTED',
				handledById: modUser.id,
				handledAt: harassmentHandledAt,
				moderatorMessage: 'Post harassment confirmed after review.',
				createdAt: reportDate,
			},
		});
	}

	// Create single moderation log for this post (harassment)
	if (harassmentHandledAt) {
		await createModerationLog(
			'REVIEW_POST_REPORT',
			modUser.id,
			undefined,
			harassmentPost.id,
			harassmentHandledAt,
		);
	}

	// ---------------- INAPPROPRIATE POST REPORT ----------------
	let inappropriateHandledAt: Date | undefined;

	for (let i = 0; i < inappropriateReporters.length; i++) {
		const existing = await prisma.report.findFirst({
			where: {
				reporterId: inappropriateReporters[i],
				reportedPostId: inappropriatePost.id,
			},
		});
		if (existing) continue;

		const reportDate = getRandomDate(inappropriatePost.createdAt, now);
		lastReportDate = reportDate;

		inappropriateHandledAt = getRandomDate(reportDate, now);
		await prisma.report.create({
			data: {
				reporterId: inappropriateReporters[i],
				reportedPostId: inappropriatePost.id,
				reportedUserId: null,
				reportCategory: 'INAPPROPRIATE_CONTENT',
				reportDescription: inappropriateDescriptions[i % inappropriateDescriptions.length],
				status: 'ACCEPTED',
				handledById: modUser.id,
				handledAt: inappropriateHandledAt,
				moderatorMessage:
					'Post content confirmed as inappropriate and violating guidelines.',
				createdAt: reportDate,
			},
		});
	}

	// Create single moderation log for this post (inappropriate)
	if (inappropriateHandledAt) {
		await createModerationLog(
			'REVIEW_POST_REPORT',
			modUser.id,
			undefined,
			inappropriatePost.id,
			inappropriateHandledAt,
		);
	}

	return lastReportDate;
}

// ---------------- HARASSMENT USER REPORT ----------------

async function createUserReport(toxicUser: any, reporterUser: any, modUser: any, afterDate: Date) {
	const existing = await prisma.report.findFirst({
		where: {
			reporterId: reporterUser.id,
			reportedUserId: toxicUser.id,
		},
	});
	if (existing) return existing.handledAt ?? existing.createdAt;

	const reportDate = getRandomDate(afterDate, now);
	const userReportHandledAt = getRandomDate(reportDate, now);

	await prisma.report.create({
		data: {
			reporterId: reporterUser.id,
			reportedPostId: null,
			reportedUserId: toxicUser.id,
			reportCategory: 'HARASSMENT',
			reportDescription:
				'Multiple posts show pattern of targeted harassment and exclusionary behavior.',
			status: 'ACCEPTED',
			handledById: modUser.id,
			handledAt: userReportHandledAt,
			moderatorMessage: 'User report confirmed. Pattern of harassment behavior documented.',
			createdAt: reportDate,
		},
	});
	await createModerationLog(
		'REVIEW_USER_REPORT',
		modUser.id,
		toxicUser.id,
		undefined,
		userReportHandledAt,
	);

	return userReportHandledAt;
}

// -------------------- BAN USER --------------------

async function banToxicUser(toxicUser: any, adminUser: any, banDate: Date) {
	const user = await prisma.user.findUnique({ where: { id: toxicUser.id } });
	if (user?.bannedAt) return;

	await prisma.user.update({
		where: { id: toxicUser.id },
		data: {
			bannedAt: banDate,
		},
	});
	await createModerationLog('BAN_USER', adminUser.id, toxicUser.id, undefined, banDate);
}

async function createTournament(userIds: number[]) {
	const existingTournament = await prisma.battle.findFirst({
		where: { theme: 'Fur, Reimagined' },
	});
	if (existingTournament) return;

	const tournament = await prisma.battle.create({
		data: {
			theme: 'Fur, Reimagined',
			createdAt: nineDaysAgo,
			startsAt: nineDaysAgo,
			endsAt: weekAgo,
			status: 'FINISHED',
			description: 'Texture speaks louder than color',
			maxPlayers: 3,
		},
	});

	const tournamentUserIds = [userIds[2], userIds[1], userIds[3]];
	const usernames = ['cha', 'leo', 'ophe'];

	const tournamentPostsData: PostData[] = [
		{
			title: 'Precision softness',
			caption: "Balance, proportion, texture. You're welcome.🖤",
			comments: [
				{
					userId: userIds[1],
					content: 'This is so intentional, love it',
					reply: {
						userId: userIds[2],
						content: 'Always 💅',
					},
				},
			],
		},
		{
			title: 'Fluffy mood',
			caption: 'Soft, warm, and a little extra ✨',
			comments: [
				{
					userId: userIds[3],
					content: 'The vibe is immaculate',
				},
			],
		},
		{
			title: 'Faux',
			caption: '',
			comments: [
				{
					userId: userIds[2],
					content: 'Less is always more with you',
					reply: {
						userId: userIds[3],
						content: '🖤',
					},
				},
			],
		},
	];

	const tournamentPosts = [];
	const winnerIndex = Math.floor(Math.random() * tournamentUserIds.length);
	const winnerId = tournamentUserIds[winnerIndex];

	for (let i = 0; i < tournamentUserIds.length; i++) {
		const userId = tournamentUserIds[i];
		const username = usernames[i];

		const allUserIds = userIds.filter((id) => id !== userId);

		await ensureTournamentImageResized(username);

		const post = await createPostsForTournament(
			userId,
			username,
			tournamentPostsData[i],
			allUserIds,
			userId === winnerId ? 4 : undefined,
		);

		tournamentPosts.push({ userId, post });

		await prisma.battleParticipant.create({
			data: {
				battleId: tournament.id,
				userId,
				postId: post.id,
				submittedAt: getRandomDate(nineDaysAgo, weekAgo),
			},
		});
	}

	await prisma.battle.update({
		where: { id: tournament.id },
		data: { winnerId },
	});

	console.log(`Tournament created with ${usernames[winnerIndex]} as winner`);
}

// -------------------- MAIN --------------------

async function main() {
	console.log('Seeding started...');

	const adminUser = await createUserIfNotExists(
		'admin@test.com',
		'admin',
		'Password0+',
		Role.ADMIN,
		'Test account for Admin',
	);

	const modUser = await createUserIfNotExists(
		'mod@test.com',
		'mod',
		'Password0+',
		Role.MOD,
		'Test account for Moderator',
	);

	const toxicUser = await createUserIfNotExists(
		'toxic@test.com',
		'toxic',
		'Password0+',
		Role.USER,
		'Test account for reports, moderation and bans.',
	);
	const users = [];

	users.push(
		await createUserIfNotExists(
			'ari@test.com',
			'ari',
			'Password0+',
			Role.USER,
			'Learning to exist without over-defining myself.',
		),
	);

	users.push(
		await createUserIfNotExists(
			'leo@test.com',
			'leo',
			'Password0+',
			Role.USER,
			'Soft energy, good vibes, and a little bit of everything I love 💖',
		),
	);

	users.push(
		await createUserIfNotExists(
			'cha@test.com',
			'cha',
			'Password0+',
			Role.USER,
			'Karl Marx with a micro skirt and a luxury bag',
		),
	);

	users.push(
		await createUserIfNotExists(
			'ophe@test.com',
			'ophe',
			'Password0+',
			Role.USER,
			'Less explanation. More presence.',
		),
	);

	const userIds = users.map((u) => u.id);

	// POSTS
	await createPostsForUser(
		users[0].id,
		users[0].username,
		[
			{
				title: 'Inner alignment',
				caption: 'Listening more than I speak.',
				comments: [
					{
						userId: users[2].id,
						content: 'As you should',
					},
				],
			},
			{
				title: 'Quiet introspection',
				caption: 'Still unpacking what this moment means. 🕊️',
				comments: [
					{
						userId: users[3].id,
						content: 'Really resonates with me',
						reply: {
							userId: users[0].id,
							content: 'Thank you for understanding',
						},
					},
				],
			},
			{
				title: 'Intentional vulnerability',
				caption: 'Trying to show up as I am, not as expected.',
				comments: [],
			},
			{
				title: 'Self-awareness',
				caption: 'Questioning the way I present myself... 🌙',
				comments: [
					{
						userId: users[1].id,
						content: 'This is so relatable',
					},
				],
			},
		],
		userIds,
	);

	await createPostsForUser(
		users[1].id,
		users[1].username,
		[
			{
				title: 'Little moment',
				caption: 'Feeling cute, might not change later 💅',
				comments: [
					{
						userId: users[3].id,
						content: 'Cute indeed',
					},
				],
			},
			{
				title: 'Good vibes only',
				caption: 'Just a little sparkle in my day ✨',
				comments: [
					{
						userId: users[0].id,
						content: 'Just a little sparkle on my feed ✨',
					},
				],
			},
			{
				title: 'Pink mood',
				caption: 'Serving soft confidence all day.',
				comments: [
					{
						userId: users[2].id,
						content: 'Love it!!',
						reply: {
							userId: users[1].id,
							content: 'tyy',
						},
					},
				],
			},
		],
		userIds,
	);

	await createPostsForUser(
		users[2].id,
		users[2].username,
		[
			{
				title: 'On purpose',
				caption: 'Nothing here is accidental.',
				comments: [
					{
						userId: users[0].id,
						content: 'oh wooow',
					},
				],
			},
			{
				title: 'Look complete',
				caption: "I noticed the details so you don't have to. 🤍",
				comments: [
					{
						userId: users[3].id,
						content: 'Impeccable as always',
						reply: {
							userId: users[2].id,
							content: '🤍',
						},
					},
				],
			},
			{
				title: 'Detail check',
				caption: "Yes, every element is intentional. No, I won't elaborate. 💅",
				comments: [],
			},
			{
				title: 'Curated, not casual',
				caption: "There's a difference, and it shows.",
				comments: [
					{
						userId: users[1].id,
						content: 'Love your shoes!! Where did you buy it?',
					},
				],
			},
		],
		userIds,
	);

	await createPostsForUser(
		users[3].id,
		users[3].username,
		[
			{
				title: 'Passing',
				caption: 'You saw it',
				comments: [
					{
						userId: users[0].id,
						content: 'I like how this refuses over-explanation. It feels intentional.',
					},
				],
			},
			{
				title: 'Minimal',
				caption: 'As expected',
				comments: [
					{
						userId: users[2].id,
						content: "Minimal doesn't mean effortless. I see the choices.",
						reply: {
							userId: users[3].id,
							content: 'Thank you giiirl',
						},
					},
				],
			},
		],
		userIds,
	);

	// TOXIC USER POSTS
	const toxicPosts: PostData[] = [
		{
			title: 'Say it louder',
			caption: "Some people really don't belong here.",
			comments: [],
		},
		{
			title: 'Just being honest',
			caption: 'If you dress like that, expect comments.',
			comments: [],
		},
	];

	await createPostsForUser(toxicUser.id, toxicUser.username, toxicPosts, userIds);

	// REPORTS ON TOXIC POSTS
	const toxicPostsFromDB = await prisma.post.findMany({
		where: {
			authorId: toxicUser.id,
		},
		orderBy: { createdAt: 'asc' },
	});

	const harassmentPost = toxicPostsFromDB[0];
	const inappropriatePost = toxicPostsFromDB[1];

	const lastReportDate = await createReports(
		toxicUser,
		userIds,
		harassmentPost,
		inappropriatePost,
		modUser,
	);

	// USER REPORT (HARASSMENT) - Random regular user reports toxic user
	const reporterUser = users[0];
	const userReportHandledAt = await createUserReport(
		toxicUser,
		reporterUser,
		adminUser,
		lastReportDate,
	);

	// BAN TOXIC USER
	if (userReportHandledAt) {
		const banDate = getRandomDate(userReportHandledAt, now);
		await banToxicUser(toxicUser, adminUser, banDate);
	}

	// FRIENDSHIPS
	await createRandomFriendships(userIds);

	// CONVERSATIONS
	await createConversations(userIds);

	// MESSAGES
	await createMessages();

	// TOURNAMENTS
	await createTournament(userIds);

	console.log('Seeding completed.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
