import { createContext, useContext } from "react";

// Defines the shape of a user object
export interface User {
	username: string; // the user's name
	email: string;    // the user's email address
	avatarUrl?: string;
	coverUrl?: string;
	bio?: string;
}

// Defines the shape of the context, meaning the fields the context must contain
interface UserContextType {
	user: User | null;                     // holds the current user, or null if no user is logged in
	setUser: (user: User | null) => void;  // function to update the user in the context; takes a User object or null and returns nothing
}


// Creates a new React context using the UserContextType
// Provides a default value for the context
const defaultUserContext: UserContextType = {
  user: null, // // default: no user is logged
  setUser: () => {}, // default: dummy function, does nothing
};

// Creates the actual React context object with the default values
export const UserContext = createContext(defaultUserContext);

// Wraps useContext(UserContext) in a custom hook called useUser
export const useUser = () => useContext(UserContext);
