import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createUserIfNotExists(
	email: string,
	username: string,
	passwordPlain: string,
	role: Role,
	displayName: string,
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
			displayName,
			bio,
			avatarUrl: "/assets/default/default-avatar.jpeg",
			coverUrl: "/assets/default/default-cover.jpeg",
		},
	});

	console.log(`${role} created successfully:`, user.email);
	return user;
}

async function seedAdminAndModerators() {
	console.log("Seeding admin and moderators...");
	await createUserIfNotExists(
		"admin@test.com",
		"admin",
		"AdminPswd0+",
		Role.ADMIN,
		"Administrator",
		"Admin account"
	);

	await createUserIfNotExists(
		"mod@test.com",
		"mod",
		"ModPswd0+",
		Role.MOD,
		"Moderator",
		"Moderator account"
	);
}

async function seedClassicUsers() {
	console.log("Seeding classic users...");
	for (let i = 0; i < 5; i++) {
		const username = `user${i}`;
		const email = `user${i}@test.com`;
		const password = `Testing${i}+`;

		await createUserIfNotExists(
			email,
			username,
			password,
			Role.USER,
			`User ${i}`,
			`Classic user account ${i}`
		);
	}
}

async function main() {
	console.log("Starting database seed...");
	await seedAdminAndModerators();
	await seedClassicUsers();
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
