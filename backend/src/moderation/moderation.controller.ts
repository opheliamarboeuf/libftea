import { ModerationService } from "./moderation.service";
import { Controller, UseGuards, Get, Put, Req, Param, ParseIntPipe} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/auth/roles.decorator";

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
		constructor(private readonly moderationService: ModerationService) {}
	
	@Roles(Role.ADMIN)
	@Get('admin/logs')
		async getAdminLogs(
			@Req() req: Request & { user: { id: number,  role: Role } }
		) {
			return this.moderationService.getAdminLogs(req.user.id, req.user.role);
		}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('reports/users/pending')
	async getAllPendingUserReports(
		@Req() req: Request & { user: { role: Role } }
	) {
		return this.moderationService.getAllPendingUserReports(req.user.role)
	}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('reports/posts/pending')
	async getAllPendingPostReports(
		@Req() req: Request & { user: { role: Role } }
	) {
		return this.moderationService.getAllPendingPostReports(req.user.role)
	}

	@Roles(Role.ADMIN, Role.MOD)
	@Put('reports/:id/assign')
	async assignReport(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request & { user: { id: number, role: Role } },
	) {
		return this.moderationService.assignReport(id, req.user.id, req.user.role)
	}
	@Put('reports/:id/unassign')
	async unassignReport(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request & { user: { id: number, role: Role } },
	) {
		return this.moderationService.unassignReport(id, req.user.id, req.user.role)
	}
}