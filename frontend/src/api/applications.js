import api from './axios'

export async function fetchApplications() {
  const response = await api.get('/applications')
  return response.data
}

export async function fetchApplicationStats() {
  const response = await api.get('/applications/stats')
  return response.data
}

export async function createApplication(data) {
  const response = await api.post('/applications', data)
  return response.data
}

export async function updateApplication(id, data) {
  const response = await api.patch(`/applications/${id}`, data)
  return response.data
}

export async function deleteApplication(id) {
  const response = await api.delete(`/applications/${id}`)
  return response.data
}
