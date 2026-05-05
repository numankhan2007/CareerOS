import api from './axios'

export async function fetchOpportunities(filters = {}) {
  const params = {}

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.type && filters.type !== 'all') {
    params.type = filters.type
  }

  if (filters.tags && filters.tags.length) {
    params.tags = filters.tags.join(',')
  }

  const response = await api.get('/opportunities', { params })
  return response.data
}

export async function fetchBookmarked() {
  const response = await api.get('/opportunities/bookmarked')
  return response.data
}

export async function toggleBookmark(id) {
  const response = await api.post(`/opportunities/${id}/bookmark`)
  return response.data
}

export async function createOpportunity(data) {
  const response = await api.post('/opportunities', data)
  return response.data
}
