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
// Check if the User already exists
const existingUser = await prisma.user.findFirst({
	where: {
	OR: [{ email }, { username }],
	},
});

if (existingUser) {
	console.log(`${role} already exists:`, existingUser.email);
	return existingUser;
}

// Hash password
const hashedPassword = await bcrypt.hash(passwordPlain, 10);

// Create User
const user = await prisma.user.create({
	data: {
	email,
	username,
	password: hashedPassword,
	role,
	},
});

// Créer Profile
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

async function main() {
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

main()
.catch((e) => {
	console.error(e);
	process.exit(1);
})
.finally(async () => {
	await prisma.$disconnect();
});

// in Backend container -> npx ts-node prisma/seed-users.ts
