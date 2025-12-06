import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-content')
  generate(@Body() body: any) {
    return this.aiService.generateDescription(body);
  }
}
