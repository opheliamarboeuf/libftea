import { Role } from "@prisma/client";

export const PERMISSIONS: Record<string, Role[]> = {
	DELETE_ANY_POST: [Role.ADMIN, Role.MOD],
	CHANGE_ADMIN_ROLE: [Role.ADMIN],
	CHANGE_MOD_ROLE: [Role.ADMIN, Role.MOD],
	BAN_USER: [Role.ADMIN],
	VIEW_ADMIN_LOGS: [Role.ADMIN],
	VIEW_MOD_LOGS: [Role.ADMIN, Role.MOD],
	REVIEW_POST_REPORT: [Role.ADMIN, Role.MOD],
	REVIEW_USER_REPORT: [Role.ADMIN],
	CREATE_TOURNAMENT: [Role.ADMIN],
}

// Creates a type that matches exactly the names of the permissions defined in the PERMISSIONS object
export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
	role: Role,
	permission: Permission
): boolean {
	// evaluates whether role exists in the array of roles for the given permission and returns true if it does, or false if it doesn’t
	return PERMISSIONS[permission].includes(role);
}