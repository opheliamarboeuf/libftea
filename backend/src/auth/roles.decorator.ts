import { SetMetadata } from '@nestjs/common';
// le décorateur va nous permettre d'ajouter des informations supplémentaires

// va nous permettre de stocker et retrouver les informations
// 'roles' = clé unique > identification dans le système
export const ROLES_KEY = 'roles';
// fonction qui nous permet d'attribuer un rôle et de les stocker dans ROLES_KEY
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
