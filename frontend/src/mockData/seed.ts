// -------------------- TYPES --------------------

type Role = 'USER' | 'MOD' | 'ADMIN';
type NotificationType = 'COMMENT' | 'COMMENT_REPLY' | 'LIKE' | 'FRIEND_REQUEST';
type ReportCategory = 'HARASSMENT' | 'INAPPROPRIATE_CONTENT';
type ReportStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';
type BattleStatus = 'UPCOMING' | 'ONGOING' | 'FINISHED';

export interface UserProfile {
	userId: number;
	bio: string | null;
	avatarUrl: string | null;
	coverUrl: string | null;
}

export interface BaseUser {
	id: number;
	email: string;
	username: string;
	role: Role;
	createdAt: Date;
	bannedAt: Date | null;
	twoFactorEnabled: boolean;
	profile: UserProfile;
}

export interface Post {
	id: number;
	title: string;
	caption: string;
	imageUrl: string;
	authorId: number;
	createdAt: Date;
	updatedAt: Date;
	author?: BaseUser;
	comments?: Comment[];
	likes?: Like[];
}

export interface Comment {
	id: number;
	content: string;
	postId: number;
	userId: number;
	parentId?: number;
	createdAt: Date;
	user?: BaseUser;
	replies?: Comment[];
}

export interface Like {
	id: number;
	userId: number;
	postId: number;
	createdAt: Date;
}

export interface Friendship {
	id: number;
	requesterId: number;
	addresseId: number;
	status: FriendshipStatus;
	createdAt: Date;
}

export interface Conversation {
	id: number;
	users: BaseUser[];
	createdAt: Date;
	messages?: Message[];
}

export interface Message {
	id: number;
	content: string;
	conversationId: number;
	senderId: number;
	createdAt: Date;
}

export interface Notification {
	id: number;
	userId: number;
	type: NotificationType;
	message: string;
	metadata: Record<string, string>;
	isRead: boolean;
	createdAt: Date;
}

export interface ModerationLog {
	id: number;
	action: string;
	actorId: number;
	targetUserId?: number;
	targetPostId?: number;
	createdAt: Date;
}

export interface Report {
	id: number;
	reporterId: number;
	reportedUserId?: number;
	reportedPostId?: number;
	reportCategory: ReportCategory;
	reportDescription: string;
	status: ReportStatus;
	handledById?: number;
	handledAt?: Date;
	moderatorMessage?: string;
	createdAt: Date;
}

export interface Battle {
	id: number;
	theme: string;
	description: string;
	createdAt: Date;
	startsAt: Date;
	endsAt: Date;
	status: BattleStatus;
	maxPlayers: number;
	winnerId?: number;
	participants?: BattleParticipant[];
}

export interface BattleParticipant {
	id: number;
	battleId: number;
	userId: number;
	postId: number;
	submittedAt: Date;
}

// -------------------- MOCK DATABASE --------------------

export const mockDatabase = {
	users: [] as BaseUser[],
	posts: [] as Post[],
	comments: [] as Comment[],
	likes: [] as Like[],
	friendships: [] as Friendship[],
	conversations: [] as Conversation[],
	messages: [] as Message[],
	notifications: [] as Notification[],
	moderationLogs: [] as ModerationLog[],
	reports: [] as Report[],
	battles: [] as Battle[],
	battleParticipants: [] as BattleParticipant[],
};

let idCounters = {
	user: 0,
	post: 0,
	comment: 0,
	like: 0,
	friendship: 0,
	conversation: 0,
	message: 0,
	notification: 0,
	moderationLog: 0,
	report: 0,
	battle: 0,
	battleParticipant: 0,
};

function generateId(type: keyof typeof idCounters): number {
	return ++idCounters[type];
}

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

// -------------------- TYPES FOR SEEDING --------------------

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

function createUser(email: string, username: string, role: Role, bio: string): BaseUser {
	const userId = generateId('user');

	const user: BaseUser = {
		id: userId,
		email,
		username,
		role,
		createdAt: new Date(),
		bannedAt: null,
		twoFactorEnabled: false,
		profile: {
			userId,
			bio,
			avatarUrl: null,
			coverUrl: null,
		},
	};

	mockDatabase.users.push(user);
	return user;
}

// -------------------- NOTIFICATIONS --------------------

function createNotification(
	userId: number,
	type: NotificationType,
	metadata: Record<string, string>,
): void {
	const notification: Notification = {
		id: generateId('notification'),
		userId,
		type,
		message: '',
		metadata,
		isRead: Math.random() > 0.5,
		createdAt: new Date(),
	};
	mockDatabase.notifications.push(notification);
}

// -------------------- MODERATION LOGS --------------------

function createModerationLog(
	action: string,
	actorId: number,
	targetUserId?: number,
	targetPostId?: number,
	createdAt?: Date,
): void {
	const log: ModerationLog = {
		id: generateId('moderationLog'),
		action,
		actorId,
		targetUserId,
		targetPostId,
		createdAt: createdAt || new Date(),
	};
	mockDatabase.moderationLogs.push(log);
}

// -------------------- POSTS + LIKES --------------------

function createPostsForUser(
	userId: number,
	username: string,
	postsData: PostData[],
	allUserIds: number[],
): void {
	const usersMap = new Map<number, string>();
	mockDatabase.users.forEach((u) => usersMap.set(u.id, u.username));

	for (let i = 0; i < postsData.length; i++) {
		const createdAt = getRandomDate(weekAgo, now);
		const postId = generateId('post');

		const post: Post = {
			id: postId,
			title: postsData[i].title,
			caption: postsData[i].caption,
			imageUrl: `${import.meta.env.BASE_URL}uploads/seed/${username}/${i + 1}-resized.jpg`,
			authorId: userId,
			createdAt,
			updatedAt: createdAt,
			comments: [],
			likes: [],
		};

		for (const commentData of postsData[i].comments) {
			const commentDate = commentData.createdAt || getRandomDate(createdAt, now);
			const commentId = generateId('comment');

			const comment: Comment = {
				id: commentId,
				content: commentData.content,
				postId,
				userId: commentData.userId,
				createdAt: commentDate,
				replies: [],
			};

			mockDatabase.comments.push(comment);
			post.comments?.push(comment);

			createNotification(userId, 'COMMENT', {
				username: usersMap.get(commentData.userId)!,
			});

			if (commentData.reply) {
				const replyDate = commentData.reply.createdAt || getRandomDate(commentDate, now);
				const replyId = generateId('comment');

				const reply: Comment = {
					id: replyId,
					content: commentData.reply.content,
					postId,
					userId: commentData.reply.userId,
					parentId: commentId,
					createdAt: replyDate,
				};

				mockDatabase.comments.push(reply);
				comment.replies?.push(reply);

				createNotification(commentData.userId, 'COMMENT_REPLY', {
					username: usersMap.get(commentData.reply.userId)!,
				});
			}
		}

		const shuffled = shuffleArray(allUserIds);
		const likeCount = Math.floor(Math.random() * 6);

		for (const likerId of shuffled.slice(0, likeCount)) {
			if (likerId === userId) continue;

			const like: Like = {
				id: generateId('like'),
				userId: likerId,
				postId,
				createdAt: getRandomDate(createdAt, now),
			};

			mockDatabase.likes.push(like);
			post.likes?.push(like);

			createNotification(userId, 'LIKE', {
				username: usersMap.get(likerId)!,
			});
		}

		mockDatabase.posts.push(post);
	}
}

// -------------------- FRIENDSHIPS --------------------

function createRandomFriendships(userIds: number[]): void {
	const usersMap = new Map<number, string>();
	mockDatabase.users.forEach((u) => usersMap.set(u.id, u.username));

	for (const userId of userIds) {
		const candidates = userIds.filter((id) => id !== userId);
		const shuffled = shuffleArray(candidates);
		const targetCount = Math.floor(Math.random() * 3) + 2;
		let created = 0;

		for (const friendId of shuffled) {
			if (created >= targetCount) break;

			const exists = mockDatabase.friendships.some(
				(f) =>
					(f.requesterId === userId && f.addresseId === friendId) ||
					(f.requesterId === friendId && f.addresseId === userId),
			);

			if (exists) continue;

			const status: FriendshipStatus = Math.random() < 0.6 ? 'PENDING' : 'ACCEPTED';

			mockDatabase.friendships.push({
				id: generateId('friendship'),
				requesterId: userId,
				addresseId: friendId,
				status,
				createdAt: new Date(),
			});

			if (status === 'PENDING') {
				createNotification(friendId, 'FRIEND_REQUEST', {
					username: usersMap.get(userId)!,
				});
			}

			created++;
		}
	}
}

// -------------------- CONVERSATIONS --------------------

function createConversations(userIds: number[]): void {
	for (const userId of userIds) {
		const friendships = mockDatabase.friendships.filter(
			(f) => (f.requesterId === userId || f.addresseId === userId) && f.status === 'ACCEPTED',
		);

		const friendIds = friendships.map((f) =>
			f.requesterId === userId ? f.addresseId : f.requesterId,
		);

		let conversationsCreated = 0;

		for (const friendId of friendIds) {
			if (conversationsCreated >= 2) break;

			const existingConversation = mockDatabase.conversations.some(
				(c) =>
					c.users.some((u) => u.id === userId) && c.users.some((u) => u.id === friendId),
			);

			if (existingConversation) continue;

			const user1 = mockDatabase.users.find((u) => u.id === userId)!;
			const user2 = mockDatabase.users.find((u) => u.id === friendId)!;

			mockDatabase.conversations.push({
				id: generateId('conversation'),
				users: [user1, user2],
				createdAt: new Date(),
				messages: [],
			});

			conversationsCreated++;
		}
	}
}

// -------------------- MESSAGES --------------------

function createMessages(): void {
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

	for (let i = 0; i < mockDatabase.conversations.length; i++) {
		const conv = mockDatabase.conversations[i];
		const messageType = (i % 2) + 1;
		const selectedMessages = messages[messageType as 1 | 2];

		const firstMessageDate = getRandomDate(weekAgo, now);

		const firstSender = conv.users[0];
		mockDatabase.messages.push({
			id: generateId('message'),
			content: selectedMessages.first,
			conversationId: conv.id,
			senderId: firstSender.id,
			createdAt: firstMessageDate,
		});

		const secondSender = conv.users[1];
		mockDatabase.messages.push({
			id: generateId('message'),
			content: selectedMessages.second,
			conversationId: conv.id,
			senderId: secondSender.id,
			createdAt: getRandomDate(firstMessageDate, now),
		});
	}
}

// -------------------- TOURNAMENTS --------------------

function createPostsForTournament(
	userId: number,
	username: string,
	postData: PostData,
	allUserIds: number[],
	forcedLikeCount?: number,
	imageFilename?: string,
	customDate?: Date,
): Post {
	const postDate = customDate ?? getRandomDate(nineDaysAgo, weekAgo);
	const postId = generateId('post');
	const resolvedImage = imageFilename ?? `${username}_tournament-resized.jpg`;

	const post: Post = {
		id: postId,
		title: postData.title,
		caption: postData.caption,
		imageUrl: `${import.meta.env.BASE_URL}uploads/seed/tournament/${resolvedImage}`,
		authorId: userId,
		createdAt: postDate,
		updatedAt: postDate,
		comments: [],
		likes: [],
	};

	for (const commentData of postData.comments) {
		const commentDate = getRandomDate(postDate, weekAgo);
		const commentId = generateId('comment');

		const comment: Comment = {
			id: commentId,
			content: commentData.content,
			postId,
			userId: commentData.userId,
			createdAt: commentDate,
			replies: [],
		};

		mockDatabase.comments.push(comment);
		post.comments?.push(comment);

		if (commentData.reply) {
			const replyDate = getRandomDate(commentDate, weekAgo);
			const replyId = generateId('comment');

			const reply: Comment = {
				id: replyId,
				content: commentData.reply.content,
				postId,
				userId: commentData.reply.userId,
				parentId: commentId,
				createdAt: replyDate,
			};

			mockDatabase.comments.push(reply);
			comment.replies?.push(reply);
		}
	}

	const shuffled = shuffleArray(allUserIds);
	const likeCount = forcedLikeCount ?? Math.floor(Math.random() * 6);

	for (const likerId of shuffled.slice(0, likeCount)) {
		if (likerId === userId) continue;

		const like: Like = {
			id: generateId('like'),
			userId: likerId,
			postId,
			createdAt: getRandomDate(postDate, weekAgo),
		};

		mockDatabase.likes.push(like);
		post.likes?.push(like);
	}

	mockDatabase.posts.push(post);
	return post;
}

function createReports(
	toxicUser: BaseUser,
	userIds: number[],
	harassmentPost: Post,
	inappropriatePost: Post,
	modUser: BaseUser,
): Date {
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

	// HARASSMENT POST REPORT (pending/unassigned)
	for (let i = 0; i < harassmentReporters.length; i++) {
		const reportDate = getRandomDate(harassmentPost.createdAt, now);
		lastReportDate = reportDate;

		mockDatabase.reports.push({
			id: generateId('report'),
			reporterId: harassmentReporters[i],
			reportedPostId: harassmentPost.id,
			reportCategory: 'HARASSMENT',
			reportDescription: harassmentDescriptions[i % harassmentDescriptions.length],
			status: 'PENDING',
			createdAt: reportDate,
		});
	}

	// INAPPROPRIATE POST REPORT
	let inappropriateHandledAt: Date | undefined;

	for (let i = 0; i < inappropriateReporters.length; i++) {
		const reportDate = getRandomDate(inappropriatePost.createdAt, now);
		lastReportDate = reportDate;

		inappropriateHandledAt = getRandomDate(reportDate, now);
		mockDatabase.reports.push({
			id: generateId('report'),
			reporterId: inappropriateReporters[i],
			reportedPostId: inappropriatePost.id,
			reportCategory: 'INAPPROPRIATE_CONTENT',
			reportDescription: inappropriateDescriptions[i % inappropriateDescriptions.length],
			status: 'ACCEPTED',
			handledById: modUser.id,
			handledAt: inappropriateHandledAt,
			moderatorMessage: 'Post content confirmed as inappropriate and violating guidelines.',
			createdAt: reportDate,
		});
	}

	if (inappropriateHandledAt) {
		createModerationLog(
			'REVIEW_POST_REPORT',
			modUser.id,
			undefined,
			inappropriatePost.id,
			inappropriateHandledAt,
		);
	}

	return lastReportDate;
}

function createUserReport(
	toxicUser: BaseUser,
	reporterUser: BaseUser,
	modUser: BaseUser,
	afterDate: Date,
): Date {
	const reportDate = getRandomDate(afterDate, now);
	const userReportHandledAt = getRandomDate(reportDate, now);

	mockDatabase.reports.push({
		id: generateId('report'),
		reporterId: reporterUser.id,
		reportedUserId: toxicUser.id,
		reportCategory: 'HARASSMENT',
		reportDescription:
			'Multiple posts show pattern of targeted harassment and exclusionary behavior.',
		status: 'ACCEPTED',
		handledById: modUser.id,
		handledAt: userReportHandledAt,
		moderatorMessage: 'User report confirmed. Pattern of harassment behavior documented.',
		createdAt: reportDate,
	});
	createModerationLog(
		'REVIEW_USER_REPORT',
		modUser.id,
		toxicUser.id,
		undefined,
		userReportHandledAt,
	);

	return userReportHandledAt;
}

function banToxicUser(toxicUser: BaseUser, adminUser: BaseUser, banDate: Date): void {
	const user = mockDatabase.users.find((u) => u.id === toxicUser.id);
	if (user && !user.bannedAt) {
		user.bannedAt = banDate;
		createModerationLog('BAN_USER', adminUser.id, toxicUser.id, undefined, banDate);
	}
}

function createTournament(userIds: number[]): void {
	const existingTournament = mockDatabase.battles.some((b) => b.theme === 'Fur, Reimagined');
	if (existingTournament) return;

	const tournament: Battle = {
		id: generateId('battle'),
		theme: 'Fur, Reimagined',
		createdAt: nineDaysAgo,
		startsAt: nineDaysAgo,
		endsAt: weekAgo,
		status: 'FINISHED',
		description: 'Texture speaks louder than color',
		maxPlayers: 3,
		participants: [],
	};

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

		// Give explicit spaced dates (most recent first)
		const postDate = new Date(weekAgo.getTime() - i * 6 * 60 * 60 * 1000);

		const post = createPostsForTournament(
			userId,
			username,
			tournamentPostsData[i],
			allUserIds,
			userId === winnerId ? 4 : undefined,
			username === 'cha'
				? 'cha_tournament1.jpg'
				: username === 'ophe'
					? 'ophe_tournament1.jpg'
					: undefined,
			postDate,
		);

		tournamentPosts.push({ userId, post });

		mockDatabase.battleParticipants.push({
			id: generateId('battleParticipant'),
			battleId: tournament.id,
			userId,
			postId: post.id,
			submittedAt: getRandomDate(nineDaysAgo, weekAgo),
		});
	}

	tournament.winnerId = winnerId;
	tournament.participants = mockDatabase.battleParticipants.filter(
		(p) => p.battleId === tournament.id,
	);

	mockDatabase.battles.push(tournament);

	console.log(`Tournament created with ${usernames[winnerIndex]} as winner`);
}

function createOngoingTournament(userIds: number[]): void {
	const existingTournament = mockDatabase.battles.some((b) => b.theme === 'Dot Revival');
	if (existingTournament) return;

	const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
	const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

	const tournament: Battle = {
		id: generateId('battle'),
		theme: 'Dot Revival',
		createdAt: twoDaysAgo,
		startsAt: twoDaysAgo,
		endsAt: inFiveDays,
		status: 'ONGOING',
		description: 'Pattern is the new neutral',
		maxPlayers: 4,
		participants: [],
	};

	const tournamentUserIds = [userIds[2], userIds[3]];
	const usernames = ['cha', 'ophe'];

	const tournamentPostsData: PostData[] = [
		{
			title: 'Dot matrix',
			caption: 'Structure in every circle. 🖤',
			comments: [
				{
					userId: userIds[3],
					content: 'The pattern does all the talking',
					reply: {
						userId: userIds[0],
						content: 'Exactly the point',
					},
				},
			],
		},
		{
			title: 'Spotted',
			caption: "You either see it or you don't.",
			comments: [
				{
					userId: userIds[1],
					content: 'I see it and I love it',
				},
			],
		},
	];

	for (let i = 0; i < tournamentUserIds.length; i++) {
		const userId = tournamentUserIds[i];
		const username = usernames[i];
		const allUserIds = userIds.filter((id) => id !== userId);

		// Give explicit spaced dates (most recent first)
		const postDate = new Date(now.getTime() - i * 6 * 60 * 60 * 1000);
		const postId = generateId('post');

		const post: Post = {
			id: postId,
			title: tournamentPostsData[i].title,
			caption: tournamentPostsData[i].caption,
			imageUrl: `${import.meta.env.BASE_URL}uploads/seed/tournament/${username === 'cha' ? 'cha_tournament2.jpg' : 'ophe_tournament2.jpg'}`,
			authorId: userId,
			createdAt: postDate,
			updatedAt: postDate,
			comments: [],
			likes: [],
		};

		for (const commentData of tournamentPostsData[i].comments) {
			const commentDate = getRandomDate(postDate, now);
			const commentId = generateId('comment');

			const comment: Comment = {
				id: commentId,
				content: commentData.content,
				postId,
				userId: commentData.userId,
				createdAt: commentDate,
				replies: [],
			};

			mockDatabase.comments.push(comment);
			post.comments?.push(comment);

			if (commentData.reply) {
				const replyId = generateId('comment');
				const reply: Comment = {
					id: replyId,
					content: commentData.reply.content,
					postId,
					userId: commentData.reply.userId,
					parentId: commentId,
					createdAt: getRandomDate(commentDate, now),
				};
				mockDatabase.comments.push(reply);
				comment.replies?.push(reply);
			}
		}

		const shuffled = shuffleArray(allUserIds);
		const likeCount = Math.floor(Math.random() * 4) + 1;

		for (const likerId of shuffled.slice(0, likeCount)) {
			if (likerId === userId) continue;
			const like: Like = {
				id: generateId('like'),
				userId: likerId,
				postId,
				createdAt: getRandomDate(postDate, now),
			};
			mockDatabase.likes.push(like);
			post.likes?.push(like);
		}

		mockDatabase.posts.push(post);

		mockDatabase.battleParticipants.push({
			id: generateId('battleParticipant'),
			battleId: tournament.id,
			userId,
			postId,
			submittedAt: getRandomDate(twoDaysAgo, now),
		});
	}

	tournament.participants = mockDatabase.battleParticipants.filter(
		(p) => p.battleId === tournament.id,
	);

	mockDatabase.battles.push(tournament);

	console.log('Ongoing tournament "Dot Revival" created');
}

// -------------------- MAIN --------------------

export function seedDatabase(): typeof mockDatabase {
	console.log('Seeding mock database started...');

	// Create admin
	const adminUser = createUser('admin@test.com', 'admin', 'ADMIN', 'Test account for Admin');

	// Create mod
	const modUser = createUser('mod@test.com', 'mod', 'MOD', 'Test account for Moderator');

	// Create toxic user
	const toxicUser = createUser(
		'toxic@test.com',
		'toxic',
		'USER',
		'Test account for reports, moderation and bans.',
	);

	// Create regular users
	const users = [];

	users.push(
		createUser(
			'ari@test.com',
			'ari',
			'USER',
			'Learning to exist without over-defining myself.',
		),
	);

	users.push(
		createUser(
			'leo@test.com',
			'leo',
			'USER',
			'Soft energy, good vibes, and a little bit of everything I love 💖',
		),
	);

	users.push(
		createUser('cha@test.com', 'cha', 'USER', 'Karl Marx with a micro skirt and a luxury bag'),
	);

	users.push(createUser('ophe@test.com', 'ophe', 'USER', 'Less explanation. More presence.'));

	const userIds = users.map((u) => u.id);

	// POSTS
	createPostsForUser(
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

	createPostsForUser(
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

	createPostsForUser(
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

	createPostsForUser(
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
	const toxicPost1Date = getRandomDate(weekAgo, now);
	const harassmentPost: Post = {
		id: generateId('post'),
		title: 'Say it louder',
		caption: "Some people really don't belong here.",
		imageUrl: `${import.meta.env.BASE_URL}uploads/toxic/1-resized.jpg`,
		authorId: toxicUser.id,
		createdAt: toxicPost1Date,
		updatedAt: toxicPost1Date,
		comments: [],
		likes: [],
	};
	mockDatabase.posts.push(harassmentPost);

	const toxicPost2Date = getRandomDate(weekAgo, now);
	const inappropriatePost: Post = {
		id: generateId('post'),
		title: 'Just being honest',
		caption: 'If you dress like that, expect comments.',
		imageUrl: `${import.meta.env.BASE_URL}uploads/toxic/2-resized.jpg`,
		authorId: toxicUser.id,
		createdAt: toxicPost2Date,
		updatedAt: toxicPost2Date,
		comments: [],
		likes: [],
	};
	mockDatabase.posts.push(inappropriatePost);

	const lastReportDate = createReports(
		toxicUser,
		userIds,
		harassmentPost,
		inappropriatePost,
		modUser,
	);

	// USER REPORT (HARASSMENT)
	const reporterUser = users[0];
	const userReportHandledAt = createUserReport(
		toxicUser,
		reporterUser,
		adminUser,
		lastReportDate,
	);

	// BAN TOXIC USER
	const banDate = getRandomDate(userReportHandledAt, now);
	banToxicUser(toxicUser, adminUser, banDate);

	// FRIENDSHIPS
	createRandomFriendships(userIds);

	// CONVERSATIONS
	createConversations(userIds);

	// MESSAGES
	createMessages();

	// TOURNAMENTS
	createTournament(userIds);
	createOngoingTournament(userIds);
	console.log('Seeding mock database completed.');

	return mockDatabase;
}

// Export for use in components
export default seedDatabase;
