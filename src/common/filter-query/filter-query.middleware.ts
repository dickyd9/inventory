import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class FilterQueryMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const { type, startDate, endDate, date, month, year } = req.query;

    if (type) {
      switch (type) {
        case 'range':
          const startDateObj = new Date(startDate);
          const endDateObj = new Date(endDate);
          break;
        case 'day':
          const exactDateObj = new Date(`${year}-${month}-${date}`);
          break;
        case 'month':
          const monthFilter = new Date(`${year}-${month}-${date}`);
          break;
        default:
          return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Jenis filter tidak valid',
          });
      }
    }

    next();
  }
}
