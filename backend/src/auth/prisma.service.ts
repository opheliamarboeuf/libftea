// PrismaService connecte le backend a la base de donnee
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
// on importe le client prisma generee depuis schema.prisma quand on fait "npx prisma generate"
import { PrismaClient } from "@prisma/client";

// cette classe peut etre importee dans d'autres classes
@Injectable()
// creation de la classe PrismaService que l'on pourra utiliser dans toute l'application
export class PrismaService
	// herite de PrismaClient pour avoir acces a des foncitons de base
	extends PrismaClient
	// la classe aura deux fonctions speciales
	implements OnModuleInit, OnModuleDestroy
	{
		// se declenche quand le module NestJS demarre
		async onModuleInit() {
			// connexion a la db PostgreSQL
			await this.$connect();
			// message indiquant que la connexion a reussi
			console.log('Prisma connected to database');
		}
		// se declenche quand le module NestJS s'arrete
		async onModuleDestroy() {
			// PrismaClient deconnecte la db
			await this.$disconnect();
		}
}