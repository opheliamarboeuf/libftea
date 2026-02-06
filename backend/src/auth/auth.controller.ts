import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

// Protects the route: only requests with a valid JWT can access it.
// Returns the current user's data based on the user ID stored in req.user by JwtStrategy.
 	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	getMe(@Req() req) {
		return this.authService.getMe(req.user.sub);
	}
}
