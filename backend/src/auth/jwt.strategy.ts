//traducteur de token, permet a NestJs de lire et verifier le token JWT
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// on indique que cette classe peut etre injectee par NestJS
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
	// super() configure la strategie JWT
	super({
		// indique ou trouver le token
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		// on verifie que le token n'a pas expire
		ignoreExpiration: false,
		// cle secrete pour verifier que le token est valide
		secretOrKey: process.env.JWT_SECRET,
	});
  }

  // appele automatiquement si le token est valide
  async validate(payload: any) {
	// playload = ce que l'on a mis dans le token
	// ce que l'on retourne ici sera stockes dans req.user
	return { sub: payload.sub };
	}
}
