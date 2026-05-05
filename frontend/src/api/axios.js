import axios from 'axios'

// Shared Axios client for all API calls.
// In production, VITE_API_BASE_URL points to the Render backend.
// In local dev, it falls back to the local FastAPI server.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_ROUTE_PATTERNS = ['/auth/login', '/auth/signup']

// Emit a global auth event on unauthorized API calls.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''
    const isAuthRequest = AUTH_ROUTE_PATTERNS.some((route) => requestUrl.includes(route))

    if (status === 401 && !isAuthRequest) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return Promise.reject(error)
  },
)

export default api