
/**
 * Extract error message from API response or error object
 */
export function getErrorMessage(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if error requires user to re-login
 */
export function isAuthenticationError(error: any): boolean {
  return error?.status_code === 401;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.status_code === 400;
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: any): boolean {
  return error?.status_code === 403;
}

/**
 * Format API error for display
 */
export function formatApiError(error: any): string {
  const message = getErrorMessage(error);
  const status = error?.error || 'ERROR';
  return `[${status}] ${message}`;
}

/**
 * Handle API error and return appropriate action
 */
export function handleApiError(error: any): {
  message: string;
  requiresRelogin: boolean;
  requiresRetry: boolean;
} {
  const requiresRelogin = isAuthenticationError(error);
  const requiresRetry = error?.status_code === 429 || error?.status_code >= 500;

  return {
    message: getErrorMessage(error),
    requiresRelogin,
    requiresRetry,
  };
}