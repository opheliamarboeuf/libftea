import { Controller, UseGuards, Post, Body, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('2fa/verify')
	verify2FA(@Body() body: { userId: number; code: string }) {
		return this.authService.verify2FA(body.userId, body.code);
	}

	@Public()
	@Post('register')
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	@Public()
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	// Protects the route: only requests with a valid JWT can access it.
	// Returns the current user's data based on the user ID stored in req.user by JwtStrategy.
	@Get('me')
	getMe(@Req() req) {
		return this.authService.getMe(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('2fa/settings')
	change2FASettings(@Req() req: Request & { user: { id: number }}) {
		return this.authService.change2FASettings(req.user.id);
	}

	// This route is called when the user clicks “Login with GitHub”.
	// Passport intercepts the request and automatically redirects to GitHub.
	@Public()
	@Get('github')
	@UseGuards(AuthGuard('github'))
	githubLogin() {}

	// GitHub redirects here after authentication
	// AuthGuard('github') retrieves the information from GitHub and calls the strategy’s validate() method
	// Generates a JWT and redirects to the frontend with the token in query params
	@Public()
	@Get('github/callback')
	@UseGuards(AuthGuard('github'))
	async githubCallback(@Req() req, @Res() res: Response) {
		const user = req.user;
		const token = this.authService.generateToken(user.id, user.role, user.username);
		res.redirect(`http://localhost:5173/auth/github/callback?token=${token.access_token}`);
	}
}
