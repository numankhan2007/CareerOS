import api from './axios'

// Fetch aggregated application stats (total, by_status, recent_activity, success_rate).
export async function fetchApplicationStats() {
  const response = await api.get('/applications/stats')
  return response.data
}

// Fetch weekly application counts for the last 8 weeks.
export async function fetchTimeline() {
  const response = await api.get('/applications/timeline')
  return response.data
}

// Fetch public opportunity aggregate stats (by_type, most_popular_tags).
export async function fetchOpportunityStats() {
  const response = await api.get('/opportunities/stats')
  return response.data
}
