import { PrismaClient, Role, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// -------------------- HELPERS --------------------

function getRandomDate(start: Date, end: Date) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffleArray<T>(array: T[]): T[] {
	return [...array].sort(() => Math.random() - 0.5);
}

// -------------------- TYPES --------------------

interface PostData {
	title: string;
	caption: string;
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

	for (let i = 0; i < postsData.length; i++) {
		const createdAt = getRandomDate(startDate, endDate);

		const post = await prisma.post.create({
			data: {
				title: postsData[i].title,
				caption: postsData[i].caption,
				imageUrl: `/assets/posts/${username}-${i + 1}.jpg`,
				authorId: userId,
				createdAt,
				updatedAt: createdAt,
			},
		});

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

// -------------------- COMMENTS --------------------

async function createCommentsForPosts(postIds: number[], userIds: number[]) {
	for (const postId of postIds) {
		const count = Math.floor(Math.random() * 5);

		for (let i = 0; i < count; i++) {
			const userId = userIds[Math.floor(Math.random() * userIds.length)];

			const comment = await prisma.comment.create({
				data: {
					content: `Comment ${i + 1}`,
					postId,
					userId,
				},
			});

			await createNotification(
				userId,
				NotificationType.COMMENT,
				`User ${userId} commented on a post`,
			);

			// reply
			if (Math.random() > 0.5) {
				const replyUserId = userIds[Math.floor(Math.random() * userIds.length)];

				await prisma.comment.create({
					data: {
						content: 'Reply',
						postId,
						userId: replyUserId,
						parentId: comment.id,
					},
				});
			}
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

async function createConversations() {
	const friendships = await prisma.friendship.findMany({
		where: { status: 'ACCEPTED' },
	});

	for (const f of friendships) {
		const exists = await prisma.conversation.findFirst({
			where: {
				User: {
					some: {
						id: f.requesterId,
					},
				},
			},
		});

		if (exists) continue;

		await prisma.conversation.create({
			data: {
				User: {
					connect: [{ id: f.requesterId }, { id: f.addresseId }],
				},
			},
		});
	}
}

// -------------------- MESSAGES --------------------

async function createMessages() {
	const conversations = await prisma.conversation.findMany({
		include: {
			User: true,
		},
	});

	for (const conv of conversations) {
		const count = Math.floor(Math.random() * 10);

		for (let i = 0; i < count; i++) {
			const sender = conv.User[Math.floor(Math.random() * conv.User.length)];

			await prisma.message.create({
				data: {
					content: `Message ${i + 1}`,
					conversationId: conv.id,
					senderId: sender.id,
				},
			});
		}
	}
}

// -------------------- MAIN --------------------

async function main() {
	console.log('Seeding started...');

	const users = [];

	users.push(
		await createUserIfNotExists('ari@test.com', 'ari', 'Password0+', Role.USER, 'Learning to exist without over-defining myself.'),
	);

	users.push(
		await createUserIfNotExists('leo@test.com', 'leo', 'Password0+', Role.USER, 'Soft energy, good vibes, and a little bit of everything I love 💖'),
	);

	users.push(
		await createUserIfNotExists('cha@test.com', 'cha', 'Password0+', Role.USER, 'If it looks effortless, it’s because I made it look that way. ✨'),
	);

	users.push(
		await createUserIfNotExists('ophe@test.com', 'ophe', 'Password0+', Role.USER, 'Less explanation. More presence.'),
	);

	const userIds = users.map((u) => u.id);

	// POSTS
	await createPostsForUser(
		users[0].id,
		users[0].username,
		[
			{ title: 'Quiet introspection', caption: 'Still unpacking what this moment means. 🕊️' },
			{
				title: 'Intentional vulnerability',
				caption: 'Trying to show up as I am, not as expected.',
			},
			{ title: 'Self-awareness', caption: 'Questioning the way I present myself... 🌙' },
			{ title: 'Inner alignment', caption: 'Listening more than I speak.' },
		],
		userIds,
	);

	await createPostsForUser(
		users[1].id,
		users[1].username,
		[
			{ title: 'Soft energy', caption: 'Just going with the vibe today ✨' },
			{ title: 'Little moment', caption: 'Feeling cute, might not change later 💅' },
			{ title: 'Pink mood', caption: 'Serving soft confidence all day.' },
			{ title: 'Good vibes only', caption: 'Just a little sparkle in my day ✨' },
		],
		userIds,
	);

	await createPostsForUser(
		users[2].id,
		users[2].username,
		[
			{ title: 'On purpose', caption: 'Nothing here is accidental.' },
			{ title: 'Look complete', caption: 'I noticed the details so you don’t have to. 🤍' },
			{
				title: 'Detail check',
				caption: 'Yes, every element is intentional. No, I won’t elaborate. 💅',
			},
			{ title: 'Curated, not casual', caption: 'There’s a difference, and it shows.' },
		],
		userIds,
	);

	await createPostsForUser(
		users[3].id,
		users[3].username,
		[
			{ title: 'Passing', caption: 'You saw it' },
			{ title: 'Minimal', caption: 'As expected' },
		],
		userIds,
	);

	const posts = await prisma.post.findMany();
	const postIds = posts.map((p) => p.id);

	// COMMENTS
	await createCommentsForPosts(postIds, userIds);

	// FRIENDSHIPS
	await createRandomFriendships(userIds);

	// CONVERSATIONS
	await createConversations();

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
