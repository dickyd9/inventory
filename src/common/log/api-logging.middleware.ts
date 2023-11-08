import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class ApiLoggingMiddleware implements NestMiddleware {
  private isRequestSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, route } = req;
    const start = Date.now();

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const elapsedTime = Date.now() - start;

      const logger = new Logger(route); // Gunakan nama controller sebagai nama logger

      if (this.isRequestSuccess(statusCode)) {
        logger.log(
          `[${method}] ${originalUrl} - ${statusCode} (${elapsedTime}ms)`,
        );
      } else {
        logger.error(
          `[${method}] ${originalUrl} - ${statusCode} (${elapsedTime}ms)`,
        );
      }
    });

    next();
  }
}
