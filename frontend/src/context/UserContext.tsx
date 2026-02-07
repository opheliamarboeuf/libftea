import { createContext, useContext } from "react";

// Defines the shape of a user object
export type User = {
	id: number;
	email: string;
	username: string;
	role: string;
	createdAt: string;
	profile: {
		bio: string | null;
		avatarUrl: string | null;
		coverUrl: string | null;
	};
};
// Defines the shape of the context, meaning the fields the context must contain
interface UserContextType {
	user: User | null;	// holds the current user, or null if no user is logged in
	  setUser: React.Dispatch<React.SetStateAction<User | null>>;	// Dispatch<SetStateAction<T>> allows pass either a value of type T or a function (prev: T) => T that receives the previous state and returns a new state
}

// Creates a new React context using the UserContextType
// Provides a default value for the context
const defaultUserContext: UserContextType = {
  user: null, // // default: no user is logged
  setUser: () => {}, // default: dummy function, does nothing
};

// Creates the React context
export const UserContext = createContext<UserContextType>(defaultUserContext);

// Wraps useContext(UserContext) in a custom hook called useUser
export const useUser = () => useContext(UserContext);


