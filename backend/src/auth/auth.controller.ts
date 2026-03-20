import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

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
}
