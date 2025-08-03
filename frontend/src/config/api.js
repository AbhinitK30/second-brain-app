// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://second-brain-backend-uhva.onrender.com'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Notes
  NOTES: `${API_BASE_URL}/api/notes`,
  NOTE_BY_ID: (id) => `${API_BASE_URL}/api/notes/${id}`,
  NOTE_ANALYTICS: `${API_BASE_URL}/api/notes/analytics`,
  NOTE_SEARCH: `${API_BASE_URL}/api/notes/search`,
  NOTE_SUMMARIZE: (id) => `${API_BASE_URL}/api/notes/${id}/summarize`,
} 