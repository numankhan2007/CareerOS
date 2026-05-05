/**
 * Centralized error handler for CareerOS.
 *
 * Every API call site imports `parseError` instead of doing inline
 * error parsing. This guarantees a consistent, user-friendly error
 * message across all pages and components.
 */

/**
 * Parse an Axios (or generic) error into a user-friendly message.
 *
 * @param {unknown} error - The error thrown by an API call.
 * @returns {{ message: string, status: number | null }}
 */
export function parseError(error) {
  // Axios wraps HTTP errors with `error.response`.
  const status = error?.response?.status ?? null

  if (status === 401) {
    // 401 is handled globally by the axios interceptor — but if a
    // component still catches it, give a sensible fallback.
    return { message: 'Your session has expired. Please log in again.', status }
  }

  if (status === 403) {
    return { message: 'You do not have permission to perform this action.', status }
  }

  if (status === 404) {
    return { message: 'This content could not be found.', status }
  }

  if (status === 409) {
    // Conflict — e.g. duplicate application.
    const detail = error?.response?.data?.detail
    return { message: detail || 'This action conflicts with existing data.', status }
  }

  if (status !== null && status >= 500) {
    return { message: 'Something went wrong on our end. Please try again.', status }
  }

  // No HTTP status → likely a network error (no internet, CORS blocked, etc.)
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return { message: 'Unable to connect. Check your internet connection.', status: null }
  }

  // Catch-all for anything else.
  return { message: 'An unexpected error occurred.', status }
}
