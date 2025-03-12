import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TestGuard } from './guards/test.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new TestGuard());
  await app.listen(3000);
}
bootstrap();
