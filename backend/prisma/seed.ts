import { PrismaClient, Role, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import sharp from 'sharp';
import { copyFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

// -------------------- HELPERS --------------------

function getRandomDate(start: Date, end: Date) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffleArray<T>(array: T[]): T[] {
	return [...array].sort(() => Math.random() - 0.5);
}

// Resize seed images to 500x500 (same as posts)
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

async function createNotification(userId: number, type: NotificationType, message: string) {
	await prisma.notification.create({
		data: {
			userId,
			type,
			message,
			isRead: Math.random() > 0.5,
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
	const startDate = new Date('2026-03-17');
	const endDate = new Date('2026-03-24');

	// Resize seed images to match post specifications (500x500)
	await ensureSeedImagesResized(username, postsData.length);

	for (let i = 0; i < postsData.length; i++) {
		const createdAt = getRandomDate(startDate, endDate);

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

		// Create comments for this post
		for (const commentData of postsData[i].comments) {
			const commentDate = commentData.createdAt || getRandomDate(createdAt, new Date());

			const comment = await prisma.comment.create({
				data: {
					content: commentData.content,
					postId: post.id,
					userId: commentData.userId,
					createdAt: commentDate,
				},
			});

			await createNotification(
				userId,
				NotificationType.COMMENT,
				`User ${commentData.userId} commented on your post`,
			);

			// Create reply if provided
			if (commentData.reply) {
				const replyDate =
					commentData.reply.createdAt || getRandomDate(commentDate, new Date());

				await prisma.comment.create({
					data: {
						content: commentData.reply.content,
						postId: post.id,
						userId: commentData.reply.userId,
						parentId: comment.id,
						createdAt: replyDate,
					},
				});

				await createNotification(
					commentData.userId,
					NotificationType.COMMENT,
					`User ${commentData.reply.userId} replied to your comment`,
				);
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

			await createNotification(
				userId,
				NotificationType.LIKE,
				`User ${likerId} liked your post`,
			);
		}
	}
}

// -------------------- FRIENDSHIPS --------------------

async function createRandomFriendships(userIds: number[]) {
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
				await createNotification(
					friendId,
					NotificationType.FRIEND_REQUEST,
					'New friend request',
				);
			}

			created++;
		}
	}
}

// -------------------- CONVERSATIONS --------------------

async function createConversations(userIds: number[]) {
	for (const userId of userIds) {
		// Get accepted friendships for this user
		const friendships = await prisma.friendship.findMany({
			where: {
				OR: [
					{ requesterId: userId, status: 'ACCEPTED' },
					{ addresseId: userId, status: 'ACCEPTED' },
				],
			},
		});

		// Get friend IDs
		const friendIds = friendships.map((f) =>
			f.requesterId === userId ? f.addresseId : f.requesterId,
		);

		// Create conversation with maximum 2 friends only
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
		// Alternate between message type 1 and 2
		const messageType = (i % 2) + 1;
		const selectedMessages = messages[messageType];

		// First message from one user
		const firstSender = conv.User[0];
		await prisma.message.create({
			data: {
				content: selectedMessages.first,
				conversationId: conv.id,
				senderId: firstSender.id,
			},
		});

		// Reply from the other user
		const secondSender = conv.User[1];
		await prisma.message.create({
			data: {
				content: selectedMessages.second,
				conversationId: conv.id,
				senderId: secondSender.id,
			},
		});
	}
}

// -------------------- MAIN --------------------

async function main() {
	console.log('Seeding started...');

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
						content: 'Love your shoes !! Where did you buy it?',
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
						content: 'Minimal doesn’t mean effortless. I see the choices.',
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

	const posts = await prisma.post.findMany();
	const postIds = posts.map((p) => p.id);

	// FRIENDSHIPS
	await createRandomFriendships(userIds);

	// CONVERSATIONS
	await createConversations(userIds);

	// MESSAGES
	await createMessages();

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
