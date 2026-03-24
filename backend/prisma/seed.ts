import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// -------------------- HELPERS --------------------

function getRandomDate(start: Date, end: Date) {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	);
}

function shuffleArray<T>(array: T[]): T[] {
	return array.sort(() => Math.random() - 0.5);
}

// -------------------- USERS --------------------

async function createUserIfNotExists(
	email: string,
	username: string,
	passwordPlain: string,
	role: Role,
	bio: string
) {
	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ email }, { username }],
		},
	});

	if (existingUser) {
		console.log(`${role} already exists:`, existingUser.email);
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
			avatarUrl: "/assets/default/default-avatar.jpeg",
			coverUrl: "/assets/default/default-cover.jpeg",
		},
	});

	console.log(`${role} created successfully:`, user.email);
	return user;
}

// -------------------- POSTS + LIKES --------------------

async function createPostsForUser(
	userId: number,
	username: string,
	count: number,
	allUserIds: number[]
) {
	const existingPosts = await prisma.post.findFirst({
		where: { authorId: userId },
	});

	if (existingPosts) {
		console.log(`Posts already exist for ${username}`);
		return;
	}

	const startDate = new Date("2026-03-17");
	const endDate = new Date("2026-03-24");

	for (let i = 1; i <= count; i++) {
		const createdAt = getRandomDate(startDate, endDate);

		const post = await prisma.post.create({
			data: {
				title: `Post ${i} de ${username}`,
				caption: `Caption du post ${i}`,
				imageUrl: `/assets/posts/${username}-${i}.jpg`,
				authorId: userId,
				createdAt: createdAt,
			},
		});

		// 🎯 Likes aléatoires (0 à 5)
		const shuffledUsers = shuffleArray([...allUserIds]);
		const likeCount = Math.floor(Math.random() * 6);

		const selectedUsers = shuffledUsers.slice(0, likeCount);

		for (const likerId of selectedUsers) {
			if (likerId === userId) continue;

			await prisma.like.create({
				data: {
					userId: likerId,
					postId: post.id,
				},
			});
		}
	}

	console.log(`${count} posts created for ${username}`);
}

// -------------------- SEED --------------------

async function seedAdminAndModerators() {
	console.log("Seeding admin and moderators...");

	await createUserIfNotExists(
		"admin@test.com",
		"admin",
		"AdminPswd0+",
		Role.ADMIN,
		"Admin account"
	);

	await createUserIfNotExists(
		"mod@test.com",
		"mod",
		"ModPswd0+",
		Role.MOD,
		"Moderator account"
	);
}

async function seedSpecificUsersWithPosts() {
	console.log("Seeding users with posts...");

	const users = [];

	const ari = await createUserIfNotExists(
		"ari@test.com",
		"ari",
		"Password0+",
		Role.USER,
		"Compte de ari"
	);
	users.push(ari);

	const leo = await createUserIfNotExists(
		"leo@test.com",
		"leo",
		"Password0+",
		Role.USER,
		"Compte de leo"
	);
	users.push(leo);

	const cha = await createUserIfNotExists(
		"cha@test.com",
		"cha",
		"Password0+",
		Role.USER,
		"Compte de cha"
	);
	users.push(cha);

	const ophe = await createUserIfNotExists(
		"ophe@test.com",
		"ophe",
		"Password0+",
		Role.USER,
		"Compte de ophe"
	);
	users.push(ophe);

	const userIds = users.map((u) => u.id);

	await createPostsForUser(ari.id, "ari", 2, userIds);
	await createPostsForUser(leo.id, "leo", 2, userIds);
	await createPostsForUser(cha.id, "cha", 3, userIds);
	await createPostsForUser(ophe.id, "ophe", 1, userIds);
}

// -------------------- MAIN --------------------

async function main() {
	console.log("Starting database seed...");

	await seedAdminAndModerators();
	await seedSpecificUsersWithPosts();

	console.log("Database seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});