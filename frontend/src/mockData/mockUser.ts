import { BaseUser } from './seed';
import { User } from '../context/UserContext';
import { mockDatabase } from './seed';
import { Post } from '../context/UserContext';

// Convert BaseUser (seed) in User (UserContext)
export function toContextUser(base: BaseUser): User {
	const friends = mockDatabase.friendships
		.filter(
			(f) =>
				(f.requesterId === base.id || f.addresseId === base.id) && f.status === 'ACCEPTED',
		)
		.map((f) => {
			const friendId = f.requesterId === base.id ? f.addresseId : f.requesterId;
			const friend = mockDatabase.users.find((u) => u.id === friendId)!;
			return {
				id: friend.id,
				username: friend.username,
				avatarUrl: friend.profile.avatarUrl,
				bannedAt: friend.bannedAt ? friend.bannedAt.toISOString() : null,
				role: friend.role,
			};
		});

	const pendingRequests = mockDatabase.friendships
		.filter((f) => f.addresseId === base.id && f.status === 'PENDING')
		.map((f) => {
			const requester = mockDatabase.users.find((u) => u.id === f.requesterId)!;
			return {
				id: requester.id,
				username: requester.username,
				avatarUrl: requester.profile.avatarUrl,
				bannedAt: requester.bannedAt ? requester.bannedAt.toISOString() : null,
				role: requester.role,
			};
		});

	const posts = mockDatabase.posts
		.filter((p) => p.authorId === base.id)
		.map((p) => ({
			id: p.id,
			title: p.title,
			caption: p.caption,
			imageUrl: p.imageUrl,
			createdAt: p.createdAt.toISOString(),
			updatedAt: p.updatedAt.toISOString(),
			author: {
				id: base.id,
				username: base.username,
				role: base.role,
			},
			likes: p.likes?.length ?? 0,
			battleParticipants: [],
		}));

	return {
		id: base.id,
		email: base.email,
		username: base.username,
		role: base.role,
		twoFactorEnabled: base.twoFactorEnabled,
		createdAt: base.createdAt.toISOString(),
		bannedAt: base.bannedAt ? base.bannedAt.toISOString() : '',
		profile: {
			bio: base.profile.bio,
			avatarUrl: base.profile.avatarUrl,
			coverUrl: base.profile.coverUrl,
		},
		friends,
		pendingRequests,
		posts,
		blockedUsers: [],
	};
}

function toContextPost(p: typeof mockDatabase.posts[0]): Post {
    const author = mockDatabase.users.find(u => u.id === p.authorId)!;
    return {
        id: p.id,
        title: p.title,
        caption: p.caption,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        author: {
            id: author.id,
            username: author.username,
            role: author.role,
        },
        likes: p.likes?.length ?? 0,
        battleParticipants: [],
    };
}

export async function fetchUserPosts(userId: number): Promise<Post[]> {
    const tournamentPostIds = new Set(
        mockDatabase.battleParticipants.map(bp => bp.postId)
    );
    return mockDatabase.posts
        .filter(p => p.authorId === userId && !tournamentPostIds.has(p.id))
        .map(toContextPost);
}

export async function fetchUserTournamentPosts(userId: number): Promise<Post[]> {
    const tournamentPostIds = new Set(
        mockDatabase.battleParticipants.map(bp => bp.postId)
    );
    return mockDatabase.posts
        .filter(p => p.authorId === userId && tournamentPostIds.has(p.id))
        .map(toContextPost);
}