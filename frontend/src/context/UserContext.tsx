import { createContext, useContext } from "react";

// Type for friend data
export type Friend = {
	id: number;
	username: string;
	avatarUrl: string | null;
};

// Type for post data
export type Post = {
	id: number;
	title: string;
	caption?: string;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
	author: {
		id: number;
		username: string;
	};
	likes: number;
};

export type Blocked = {
	id: number;
	username: string;
	avatarUrl: string | null;
}

// Defines the shape of a user object
export type User = {
	id: number;
	email: string;
	username: string;
	role: string;
	createdAt: string;
	profile: {
		bio: string | null;
		displayName: string | null;
		avatarUrl: string | null;
		coverUrl: string | null;
	};
	friends: Friend[];
	pendingRequests: Friend[];
	conversations?: Array<any>;
    id: number;
    email: string;
    username: string;
    role: string;
    createdAt: string;
    profile?: {
        bio: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        coverUrl: string | null;
    };
    friends: Friend[];
    pendingRequests: Friend[];
	conversations?: Array<any>;
    posts: Post[];
};
// Defines the shape of the context, meaning the fields the context must contain
interface UserContextType {
	user: User | null;	// holds the current user, or null if no user is logged in
	setUser: React.Dispatch<React.SetStateAction<User | null>>;	// Dispatch<SetStateAction<T>> allows pass either a value of type T or a function (prev: T) => T that receives the previous state and returns a new state
	refreshUser: () => Promise<void>;	// Function to refresh user data from server
}

// Creates a new React context using the UserContextType
// Provides a default value for the context
const defaultUserContext: UserContextType = {
  user: null, // // default: no user is logged
  setUser: () => {}, // default: dummy function, does nothing
  refreshUser: async () => {}, // default: dummy function, does nothing
};

// Creates the React context
export const UserContext = createContext<UserContextType>(defaultUserContext);

// Wraps useContext(UserContext) in a custom hook called useUser
export const useUser = () => useContext(UserContext);


