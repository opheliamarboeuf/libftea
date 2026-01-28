// handles password hashing (bcrypt), user verification, JWT creation, and DB access via Prisma

// BadRequestException = erreur 400, UnauthorizedException = erreur 401
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
// sert a parler a db
import { PrismaService } from '../prisma.service';
// sert pour les erreurs Prisma (pour reconnaitre erreur P002)
import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// donnes recues du front
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	// demande a nest d'injecter ces services 
	constructor(
		private prisma: PrismaService,
		private JwtService: JwtService,
	) {}
}
