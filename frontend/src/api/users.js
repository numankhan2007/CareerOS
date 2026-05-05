import api from './axios'

// Fetch aggregate stats for the profile header.
export async function fetchUserStats() {
  const response = await api.get('/users/me/stats')
  return response.data
}

// Partially update user profile fields (name, skills, resume_link).
export async function updateProfile(data) {
  const response = await api.patch('/users/me', data)
  return response.data
}

// Change password after verifying the current one.
export async function changePassword(data) {
  const response = await api.post('/users/me/password', data)
  return response.data
}

// Permanently delete user account and all related data.
export async function deleteAccount() {
  const response = await api.delete('/users/me')
  return response.data
}
