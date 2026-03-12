import { ModerationService } from "./moderation.service";
import { Controller, UseGuards, Get, Body, Post, Put, Req, Param, ParseIntPipe} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/auth/roles.decorator";
import { HandleReportDto } from './dto/handleReport.dto';
import { ReportDto } from "./dto/report.dto";

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationController {
		constructor(private readonly moderationService: ModerationService) {}
	
	@Post('reports/posts/:id')
	async reportPost(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: ReportDto,
		@Req() req: Request & { user: { id: number } }
		) {
			return this.moderationService.reportPost(id, dto, req.user.id);
		}

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
	@Get('reports/posts/mine')
	async getMyPostReports(
		@Req() req: Request & { user: { id: number, role: Role } }
		) {
			return this.moderationService.getMyPostReports(req.user.id, req.user.role)
		}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('reports/posts/all/assigned')
	async getAllAssignedPostReports(
		@Req() req: Request & { user: { role: Role } }
		) {
			return this.moderationService.getAllAssignedPostReports(req.user.role)
		}

	@Roles(Role.ADMIN, Role.MOD)
	@Get('reports/posts/all/handled')
	async getAllHandledPostReports(
		@Req() req: Request & { user: { role: Role } }
		) {
			return this.moderationService.getAllHandledPostReports(req.user.role)
		}

	@Roles(Role.ADMIN, Role.MOD)
	@Put('reports/:id/assign')
	async assignReport(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request & { user: { id: number, role: Role } },
		) {
			return this.moderationService.assignReport(id, req.user.id, req.user.role)
		}
	
	@Roles(Role.ADMIN, Role.MOD)
	@Put('reports/:id/unassign')
	async unassignReport(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: Request & { user: { id: number, role: Role } },
		) {
			return this.moderationService.unassignReport(id, req.user.id, req.user.role)
		}

	@Roles(Role.ADMIN, Role.MOD)
	@Put('reports/:id/accept')
	async acceptPostReport(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: HandleReportDto,
		@Req() req: Request & { user: { id: number, role: Role } },
		) {
			return this.moderationService.acceptReport(id, dto, req.user.id, req.user.role)
		}

	@Roles(Role.ADMIN, Role.MOD)
	@Put('reports/:id/reject')
	async rejectPostReport(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: HandleReportDto,
		@Req() req: Request & { user: { id: number, role: Role } },
		) {
			return this.moderationService.rejectReport(id, dto, req.user.id, req.user.role)
		}
}