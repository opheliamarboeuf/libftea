import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createUserIfNotExists(
	email: string,
	username: string,
	passwordPlain: string,
	displayName: string,
	bio: string
) {
	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ email }, { username }],
		},
	});

	if (existingUser) {
		console.log(`User already exists:`, existingUser.email);
		return existingUser;
	}

	const hashedPassword = await bcrypt.hash(passwordPlain, 10);

	const user = await prisma.user.create({
		data: {
			email,
			username,
			password: hashedPassword,
			role: Role.USER,
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

	console.log(`User created successfully:`, user.email);
	return user;
}

async function createClassicUsers() {
	for (let i = 0; i < 5; i++) {
		const username = `user${i}`;
		const email = `user${i}@test.com`;
		const password = `Testing${i}+`;

		await createUserIfNotExists(
			email,
			username,
			password,
			`User ${i}`,
			`Classic user account ${i}`
		);
	}
}

async function main() {
	await createClassicUsers();
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

	// in Backend container -> npx ts-node prisma/seed-users.ts
