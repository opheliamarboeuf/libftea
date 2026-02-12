import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
	super({
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // extract the token from the Authorization header
		ignoreExpiration: false, // reject the request if the token has expired (401 Unauthorized)
		secretOrKey: process.env.JWT_SECRET, // secret key used to sign and verify JWT tokens
	});
  }

  async validate(payload: any) {
	return { id: payload.sub, username: payload.username }; // the returned object is attached to req.user, contains the user ID
	}
}
