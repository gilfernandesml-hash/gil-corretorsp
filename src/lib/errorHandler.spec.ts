import { AppError, formatErrorMessage, withErrorHandling } from './errorHandler';

describe('errorHandler', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(
        'Test error message',
        'TEST_ERROR',
        400,
        { detail: 'Additional context' }
      );

      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ detail: 'Additional context' });
    });

    it('should default statusCode to 500', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format AppError message', () => {
      const error = new AppError('Test message', 'TEST');
      expect(formatErrorMessage(error)).toBe('Test message');
    });

    it('should format Error message', () => {
      const error = new Error('Test message');
      expect(formatErrorMessage(error)).toBe('Test message');
    });

    it('should format string error', () => {
      expect(formatErrorMessage('Test error')).toBe('Test error');
    });

    it('should return default message for unknown error', () => {
      expect(formatErrorMessage({ unknown: 'object' })).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });
  });

  describe('withErrorHandling', () => {
    it('should execute function successfully', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withErrorHandling(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on error', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValueOnce('success');

      const result = await withErrorHandling(fn, { retries: 1 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(
        withErrorHandling(fn, { retries: 2 })
      ).rejects.toThrow('Failed');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onError callback on failure', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));
      const onError = jest.fn();

      await expect(
        withErrorHandling(fn, { retries: 1, onError })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledTimes(2);
    });
  });
});
