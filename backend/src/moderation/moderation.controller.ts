import { ModerationService } from "./moderation.service";
import { Controller, UseGuards, Get, Req } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/auth/roles.decorator";

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
		constructor(private readonly moderationService: ModerationService) {}
	
	@Roles(Role.ADMIN)
	@Get('admin')
		async getAdminLogs(
			@Req() req: Request & { user: { id: number,  role: Role } }
		) {
			return this.moderationService.getAdminLogs(req.user.id, req.user.role);
		}
}