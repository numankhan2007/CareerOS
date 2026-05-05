import api from './axios'

// Fetch full personalized recommendations with scores and metadata.
export async function fetchRecommendations() {
  const response = await api.get('/recommendations')
  return response.data
}

// Fetch top 3 recommendations — lightweight version for dashboard widget.
export async function fetchQuickRecommendations() {
  const response = await api.get('/recommendations/quick')
  return response.data
}
