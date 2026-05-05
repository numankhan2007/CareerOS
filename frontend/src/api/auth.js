import api from './axios'

// Login an existing user and receive a JWT.
export async function loginUser(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

// Create a new account and receive a JWT.
export async function signupUser(name, email, password) {
  const response = await api.post('/auth/signup', { name, email, password })
  return response.data
}

// Fetch the currently authenticated user using bearer token.
export async function fetchCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

// Clear active session cookie on backend.
export async function logoutUser() {
  const response = await api.post('/auth/logout')
  return response.data
}