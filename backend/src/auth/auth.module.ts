// groups auth-related controllers and services together
// defines which controllers and services exist and specifies what this module exports to other parts of the application

// importation du decorateur @Module qui nous sert a definir un modele
// un decorateur indique a NestJS comment utiliser ma classe
// cette classe est un module qui regroupe controller et service
import { Module } from '@nestjs/common';
// importation du service, le module doit savoir quel service il gere
import { AuthService } from './auth.service';
// importation du controller, le module doit savoir quel controller il gere
import { AuthController } from './auth.controller';
// importation du module JWT pour creer et verifier les tokens 
import { JwtModule } from '@nestjs/jwt';
// Pasport = systeme d'authentificaion standard
import { PassportModule } from '@nestjs/passport';
// importation du service prisma pour acceder a la base de donnee
// on va l'utiliser pour creer un utilisateur, chercher un utilisateur et verifier un login
import { PrismaService } from '../prisma.service';
// la strategie JWT que l'on a creee
import { JwtStrategy } from './jwt.strategy';
//le jwt-auth.guard
import { JwtAuthGuard } from './jwt-auth.guard';

// declaration d'un module NestJS, module = bloc logique
@Module({
	// liste des autres nodules utilises par AuthModule, ajout de foncitonnalites externes
	imports: [
		// on defini JWT comme strategie par defaut
		PassportModule.register({ defaultStrategy: 'jwt' }),
		// on appelle la fonction register du module JWT avec les parametres suivants 
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			// le token expire apres 1 heure
			signOptions: { expiresIn: '1h' },
		}),
	],
	providers: [AuthService, PrismaService, JwtStrategy, JwtAuthGuard],
	exports: [JwtAuthGuard, JwtStrategy, PassportModule],
	controllers: [AuthController],
})
// on exporte le module pour que AppModule puisse l'utiliser

export class AuthModule {}
