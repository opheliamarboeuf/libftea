// groups auth-related controllers and services together
// defines which controllers and services exist and specifies what this module exports to other parts of the application

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
