const STORAGE_KEY = 'sumopod_conversations'
const API_KEY_STORAGE = 'sumopod_api_key'
const MODEL_STORAGE = 'sumopod_model'

export const storage = {
  getConversations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  saveConversations(conversations) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
      console.error('Storage full:', e)
    }
  },

  getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE) || ''
  },

  saveApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE, key)
  },

  getModel() {
    return localStorage.getItem(MODEL_STORAGE) || 'gpt-4o'
  },

  saveModel(model) {
    localStorage.setItem(MODEL_STORAGE, model)
  },
}

export function createConversation(title = 'New Chat') {
  return {
    id: crypto.randomUUID(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: null,
  }
}

export function generateTitle(firstMessage) {
  const text = firstMessage.trim()
  if (text.length <= 40) return text
  return text.substring(0, 37) + '...'
}
