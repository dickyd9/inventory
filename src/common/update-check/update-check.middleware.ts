import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class UpdateCheckMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const unique = req.params.id;
    next();
  }
}

function isValidItemId(itemId: string): boolean {
  // Implementasi validasi ID Anda di sini
  // Anda dapat memeriksa ID dalam database atau mengikuti aturan validasi Anda
  return true;
}
