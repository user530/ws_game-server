import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) { }

  getHello(): string {
    console.log(this.configService.get('database.entities'));
    return 'Hello World!';
  }
}
