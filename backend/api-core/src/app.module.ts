import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertiesModule } from './modules/properties/properties.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PropertiesModule, AiModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
