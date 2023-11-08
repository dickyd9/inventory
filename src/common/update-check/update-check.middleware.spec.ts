import { UpdateCheckMiddleware } from './update-check.middleware';

describe('UpdateCheckMiddleware', () => {
  it('should be defined', () => {
    expect(new UpdateCheckMiddleware()).toBeDefined();
  });
});
