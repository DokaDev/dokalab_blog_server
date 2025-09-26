import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { TypedConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  const configService = app.get(TypedConfigService);

  await app.listen(configService.get('PORT'));
  console.log(
    `🚀 Server ready at http://localhost:${configService.get('PORT')}/graphql`,
  );
}
bootstrap();
