import { PrismaService } from "src/prisma/prisma.service";
import { Injectable, BadRequestException } from "@nestjs/common";
import { hasPermission } from "src/auth/permissions";
import { Role } from "@prisma/client";

@Injectable()
export class ModerationService {
	constructor(
		private prisma: PrismaService,
	) {}

	async getAdminLogs(userId: number, userRole: Role){

		// Check if the user is the post author or has the permission to delete the post
		if (!hasPermission(userRole, "VIEW_ADMIN_LOGS")) {
			throw new BadRequestException("You do not have the right to see the administrator logs");
		}
		

		const logs = await this.prisma.moderationLog.findMany({
			select: {
				id: true,
				action: true,
				createdAt: true,
				actor: {select: {id: true, username: true}},
				targetUser: { select: { id: true, username: true } },
				targetPost: { select: { id: true, title: true }},
				targetBattle: { select: { id: true, theme: true }},
			},
			orderBy: {createdAt: 'desc'},
		});
		return logs;
	}
}
