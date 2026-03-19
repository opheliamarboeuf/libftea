import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ReportType, ReportStatus } from '@prisma/client';

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendBanNotification(email: string, username: string, reason?: string): Promise<void> {
		try {
			const result = await this.mailerService.sendMail({
				to: email,
				subject: 'Your account has been banned',
				template: 'ban-notification',
				context: {
					username,
					reason,
					appName: 'Libftea',
					contactEmail: 'support@libftea.com',
				},
			});
		return result;
		} catch (error) {
			console.error('Failed to send email:', { username, email, error: error.message, fullError: error });
			throw error;
		}
	}

	async sendUnbanNotification(email: string, username: string): Promise<void> {
    	try {
			const result = await this.mailerService.sendMail({
				to: email,
				subject: 'Your account has been restored',
				template: 'unban-notification',
				context: {
					username,
					appName: 'Libftea',
					contactEmail: 'support@libftea.com',
				},
			});
			return result;
    	} catch (error) {
		console.error('Failed to send email:', { username, email, error: error.message, fullError: error });
		throw error;
    }
}

	async sendBanReportNotification(email: string, username: string, reason?: string): Promise<void> {
		try {
			const result = await this.mailerService.sendMail({
				to: email,
				subject: 'Your account has been banned',
				template: 'ban-report-notification',
				context: {
					username,
					reason,
					appName: 'Libftea',
					contactEmail: 'support@libftea.com',
				},
			});
		return result;
		} catch (error) {
			console.error('Failed to send email:', { username, email, error: error.message, fullError: error });
			throw error;
		}
	}
	
	async sendReportConfirmation(
		email: string,
		username: string,
		report: { id: number; reportCategory: ReportType; reportDescription?: string | null },): Promise<void> {
			try {
				await this.mailerService.sendMail({
					to: email,
					subject: 'Your report has been submitted',
					template: 'report-confirmation',
					context: {
						username,
						reportId: report.id,
						category: report.reportCategory,
						description: report.reportDescription,
						appName: 'Libftea',
					},
				});
			} catch (error) {
				console.error(`Failed to send report confirmation to ${email}`, error.stack);
				throw error;
			}
		}
		
	async sendReportUpdate(
		username: string,
		email: string,
		report: {
			id: number;
			reportCategory: ReportType;
			reportDescription?: string | null;
			status: ReportStatus;
			moderatorMessage?: string | null;
		},
	): Promise<void> {
		try {
			await this.mailerService.sendMail({
				to: email,
				subject: 'An update on your report',
				template: 'report-update',
				context: {
					username,
					reportId: report.id,
					category: report.reportCategory,
					description: report.reportDescription,
					status: report.status,
						moderatorMessage: report.moderatorMessage,
						appName: 'Libftea',
					},
				});
			} catch (error) {
				console.error(`Failed to send report update notification to ${email}`, error.stack);
				throw error;
			}
		}
	}