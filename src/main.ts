import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { PORT } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}
bootstrap();
