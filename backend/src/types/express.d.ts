import { Role } from '@prisma/client';

declare global {
	namespace Express {
		interface User {
			id: number;
			username: string;
			role: Role;
		}
	}
}
