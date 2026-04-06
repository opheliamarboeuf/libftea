// import { PrismaClient, Role, NotificationType } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// const now = new Date();

// function shuffleArray<T>(array: T[]): T[] {
//     return [...array].sort(() => Math.random() - 0.5);
// }

// async function createUserIfNotExists(email: string, username: string, passwordPlain: string, role: Role) {
//     const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
//     if (existing) return existing;

//     const hashedPassword = await bcrypt.hash(passwordPlain, 10);
//     const user = await prisma.user.create({
//         data: { email, username, password: hashedPassword, role }
//     });

//     await prisma.profile.create({
//         data: { userId: user.id, bio: `Bio of ${username}`, avatarUrl: '', coverUrl: '' },
//     });

//     return user;
// }

// async function createPost(userId: number, title: string, caption: string) {
//     return prisma.post.create({
//         data: { authorId: userId, title, caption, imageUrl: '', createdAt: now, updatedAt: now }
//     });
// }

// async function createComment(postId: number, userId: number, content: string) {
//     return prisma.comment.create({
//         data: { postId, userId, content, createdAt: now }
//     });
// }

// async function createLike(postId: number, userId: number) {
//     return prisma.like.create({ data: { postId, userId } });
// }

// async function createNotification(userId: number, type: NotificationType, metadata: Record<string, string>) {
//     return prisma.notification.create({ data: { userId, type, metadata: JSON.stringify(metadata), isRead: false, message: '' } });
// }

// async function createRandomFriendships(userIds: number[]) {
//     for (const userId of userIds) {
//         const candidates = userIds.filter(id => id !== userId);
//         const shuffled = shuffleArray(candidates);
//         const friendCount = Math.floor(Math.random() * 2) + 1;

//         for (let i = 0; i < friendCount; i++) {
//             const friendId = shuffled[i];
//             const exists = await prisma.friendship.findFirst({
//                 where: {
//                     OR: [
//                         { requesterId: userId, addresseId: friendId },
//                         { requesterId: friendId, addresseId: userId },
//                     ],
//                 },
//             });
//             if (exists) continue;

//             const status = Math.random() > 0.5 ? 'ACCEPTED' : 'PENDING';
//             await prisma.friendship.create({ data: { requesterId: userId, addresseId: friendId, status } });
//         }
//     }
// }

// async function main() {
//     console.log('Seeding started...');

//     const admin = await createUserIfNotExists('admin@test.com', 'admin', 'Password0+', Role.ADMIN);
//     const mod = await createUserIfNotExists('mod@test.com', 'mod', 'Password0+', Role.MOD);

//     const users = [
//         await createUserIfNotExists('ari@test.com', 'ari', 'Password0+', Role.USER),
//         await createUserIfNotExists('leo@test.com', 'leo', 'Password0+', Role.USER),
//         await createUserIfNotExists('cha@test.com', 'cha', 'Password0+', Role.USER),
//         await createUserIfNotExists('ophe@test.com', 'ophe', 'Password0+', Role.USER),
//     ];

//     const userIds = users.map(u => u.id);

//     // Create posts, comments, likes, notifications
//     for (const user of users) {
//         const post = await createPost(user.id, `Post of ${user.username}`, `Caption of ${user.username}`);

//         // Comments from other users
//         for (const commenter of users.filter(u => u.id !== user.id)) {
//             const comment = await createComment(post.id, commenter.id, `Comment from ${commenter.username}`);
//             await createNotification(user.id, NotificationType.COMMENT, { username: commenter.username });
//         }

//         // Likes from random users
//         const shuffled = shuffleArray(users.filter(u => u.id !== user.id));
//         const likeCount = Math.floor(Math.random() * users.length);
//         for (const liker of shuffled.slice(0, likeCount)) {
//             await createLike(post.id, liker.id);
//             await createNotification(user.id, NotificationType.LIKE, { username: liker.username });
//         }
//     }

//     // Friendships
//     await createRandomFriendships(userIds);

//     console.log('Seeding completed.');
// }

// main()
//     .catch(e => console.error(e))
//     .finally(async () => await prisma.$disconnect());