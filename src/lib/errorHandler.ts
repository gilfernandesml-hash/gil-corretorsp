/**
 * Global Error Handler Utility
 * Centralizes error handling across the application
 */

interface ErrorContextType {
  code: string;
  message: string;
  statusCode?: number;
  timestamp: Date;
  context?: Record<string, any>;
}

class AppError extends Error {
  public code: string;
  public statusCode: number;
  public context: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.name = 'AppError';
  }
}

/**
 * Handle async errors with retry logic
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delayMs?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { retries = 0, delayMs = 1000, onError } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (onError) {
        onError(lastError, attempt + 1);
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError!;
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context: ErrorContextType['context'] = {}
): void {
  const timestamp = new Date().toISOString();

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}]`, error, context);
  }

  // In production, send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production' && window.Sentry) {
    window.Sentry?.captureException(error, {
      tags: { context: JSON.stringify(context) },
    });
  }
}

/**
 * Handle API errors
 */
export async function handleApiError(
  response: Response,
  context: string
): Promise<never> {
  const data = await response.json().catch(() => ({}));

  const error = new AppError(
    data.message || `API Error: ${context}`,
    data.code || 'API_ERROR',
    response.status,
    { context, responseData: data }
  );

  logError(error, { context });
  throw error;
}

export { AppError, type ErrorContextType };
