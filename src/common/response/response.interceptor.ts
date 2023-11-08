import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const method = request.method;

        if (method === 'GET') {
          if (Array.isArray(data)) {
            if (!data.length) return { message: 'Data not found!', data: [] };
            const sortColumn = request.query.sort_column || '';
            const sortDirection = request.query.sort_direction || 'asc';

            // Sort Data
            data.sort((a, b) => {
              if (
                typeof a[sortColumn] === 'number' &&
                typeof b[sortColumn] === 'number'
              ) {
                if (sortDirection === 'asc') {
                  return a[sortColumn] - b[sortColumn];
                } else if (sortDirection === 'desc') {
                  return b[sortColumn] - a[sortColumn];
                }
              } else if (sortColumn === 'createdAt') {
                const dateA = new Date(a[sortColumn]);
                const dateB = new Date(b[sortColumn]);

                if (sortDirection === 'asc') {
                  return dateA.getTime() - dateB.getTime();
                } else if (sortDirection === 'desc') {
                  return dateB.getTime() - dateA.getTime();
                }
              } else {
                if (
                  a[sortColumn] !== undefined &&
                  b[sortColumn] !== undefined
                ) {
                  if (sortDirection === 'asc') {
                    return a[sortColumn].localeCompare(b[sortColumn]);
                  } else if (sortDirection === 'desc') {
                    return b[sortColumn].localeCompare(a[sortColumn]);
                  }
                }
              }
              return 0; // Default jika sortDirection tidak valid atau kolom tidak ada
            });

            // Pagination
            const page = Number(request.query.page) || 1;
            const limit = Number(request.query.limit) || 5;
            const totalItems = data.length;
            const totalPages = Math.ceil(totalItems / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const items = data.slice(startIndex, endIndex);
            return {
              message: `Data Found!`,
              data: items,
              meta: {
                totalItems,
                totalPages,
                itemsPerPage: limit,
                currentPage: page,
                sortDirection,
                sortColumn,
              },
            };
          }
          return data;
        }

        return data;
      }),
    );
  }
}
