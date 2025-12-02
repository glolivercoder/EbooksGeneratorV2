// Configuração da API
export const API_BASE_URL = 'http://localhost:8000'

// Endpoint URLs
export const API_ENDPOINTS = {
  // Book endpoints
  GENERATE_FULL: `${API_BASE_URL}/api/book/generate-full`,
  GENERATE_OUTLINE: `${API_BASE_URL}/api/book/generate-outline`,
  BOOK_STATUS: (bookId: string) => `${API_BASE_URL}/api/book/status/${bookId}`,
  BOOK_DATA: (bookId: string) => `${API_BASE_URL}/api/book/${bookId}`,
  CHAPTER_RESEARCH_SOURCES: (bookId: string, chapterNumber: number) => 
    `${API_BASE_URL}/api/book/${bookId}/chapter/${chapterNumber}/research-sources`,
  
  // Prompt endpoints
  OPTIMIZE_PROMPT: `${API_BASE_URL}/api/prompt/optimize`,
  
  // Outline endpoints
  OUTLINE_HISTORY: `${API_BASE_URL}/api/outline/history`,
  SAVE_OUTLINE_HISTORY: `${API_BASE_URL}/api/outline/history`,
  
  // Research endpoints
  VALIDATE_SOURCE: `${API_BASE_URL}/api/research/validate-source`,
  RESEARCH_TOPIC: `${API_BASE_URL}/api/research/topic`,
  
  // System endpoints
  HEALTH: `${API_BASE_URL}/api/health`,
  ACTIVE_BOOKS: `${API_BASE_URL}/api/books/active`,
  LOGS: `${API_BASE_URL}/api/logs`
} as const

// Helper function para fazer requisições
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}
