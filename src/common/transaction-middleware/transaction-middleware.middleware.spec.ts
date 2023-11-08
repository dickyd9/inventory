import { TransactionMiddlewareMiddleware } from './transaction-middleware.middleware';

describe('TransactionMiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new TransactionMiddlewareMiddleware()).toBeDefined();
  });
});
