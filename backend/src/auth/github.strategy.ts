import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from './auth.service';

@Injectable()
// Set up the OAuth connection with GitHub
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.GITHUB_CLIENT_ID, // GitHub OAuth client ID
			clientSecret: process.env.GITHUB_CLIENT_SECRET, // GitHub OAuth client secret 
			callbackURL: process.env.GITHUB_CALLBACK_URL, // URL where GitHub redirects after authentication
			scope: ['user:email'], // Permissions requested from the user
			customHeaders: { 'User-Agent': 'transcendence' },
		});
	}

	async validate(accessToken: string, refreshToken: string, githubProfile: any) {
		return this.authService.findOrCreateGithubUser(githubProfile);
	}
}