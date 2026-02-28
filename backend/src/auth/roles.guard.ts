import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// clé que l'on a créée pour retrouver nos rôles
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate
{
	constructor(private reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean
	{
		// récupération des rôles depuis le décorateur
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
		// si pas de rôle requis
		if (!requiredRoles)
			return true;
		// on récupère l'utilisateur de la requête
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user)
		{
			throw new ForbiddenException("User doesn't exist");
		}
		// vérifie si le rôle de l'utilisateur est autorisé
		if (!requiredRoles.includes(user.role))
		{
			throw new ForbiddenException("Admin access only");
		}
		return true;
	}
}