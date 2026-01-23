// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }

import { Controller, Get } from '@nestjs/common';

@Controller('test1')
export class AppController {
  @Get('test2')
  getTest() {
    return {
      name: 'Ophe',
      value: 5,
    };
  }
}
