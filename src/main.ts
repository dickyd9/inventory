import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './common/exception/http.exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { LoggerFactory } from './common/log/logger.factory';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory('Logging'),
    cors: true,
  });
  const corsOptions: CorsOptions = {
    origin: '*',
    credentials: false,
    // origin: [
    //   'http://127.0.0.1:5173',
    //   'http://127.0.0.1:5174',
    //   'https://654bcd947422180008e3e2d7--digpos.netlify.app',
    //   '*'
    // ],
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: false,
  };
  app.enableCors(corsOptions);

  app.setGlobalPrefix('api');
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}
bootstrap();
