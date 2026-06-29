import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const loadConversations = () => {
  try {
    const saved = localStorage.getItem('chat-conversations')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const loadActiveId = () => {
  try {
    return localStorage.getItem('chat-active-id') || null
  } catch {
    return null
  }
}

const loadTheme = () => {
  try {
    return localStorage.getItem('chat-theme') || 'light'
  } catch {
    return 'light'
  }
}

const saveConversations = (conversations) => {
  localStorage.setItem('chat-conversations', JSON.stringify(conversations))
}

const saveActiveId = (id) => {
  if (id) localStorage.setItem('chat-active-id', id)
  else localStorage.removeItem('chat-active-id')
}

export const useStore = create((set, get) => ({
  conversations: loadConversations(),
  activeConversationId: loadActiveId(),
  theme: loadTheme(),
  model: localStorage.getItem('chat-model') || 'openai',
  isStreaming: false,
  searchQuery: '',

  setTheme: (theme) => {
    localStorage.setItem('chat-theme', theme)
    set({ theme })
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(next)
  },

  setModel: (model) => {
    localStorage.setItem('chat-model', model)
    set({ model })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get()
    return conversations.find((c) => c.id === activeConversationId) || null
  },

  createConversation: () => {
    const id = uuidv4()
    const conversation = {
      id,
      title: 'New Chat',
      messages: [],
      model: get().model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const conversations = [...get().conversations, conversation]
    set({ conversations, activeConversationId: id })
    saveConversations(conversations)
    saveActiveId(id)
    return id
  },

  deleteConversation: (id) => {
    const conversations = get().conversations.filter((c) => c.id !== id)
    let activeConversationId = get().activeConversationId
    if (activeConversationId === id) {
      activeConversationId = conversations.length > 0 ? conversations[conversations.length - 1].id : null
    }
    set({ conversations, activeConversationId })
    saveConversations(conversations)
    saveActiveId(activeConversationId)
  },

  renameConversation: (id, title) => {
    const conversations = get().conversations.map((c) =>
      c.id === id ? { ...c, title, updatedAt: Date.now() } : c
    )
    set({ conversations })
    saveConversations(conversations)
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id })
    saveActiveId(id)
  },

  addMessage: (conversationId, message) => {
    const conversations = get().conversations.map((c) => {
      if (c.id !== conversationId) return c
      const messages = [...c.messages, message]
      const title =
        c.title === 'New Chat' && message.role === 'user'
          ? message.content.slice(0, 60) || 'New Chat'
          : c.title
      return { ...c, messages, title, updatedAt: Date.now() }
    })
    set({ conversations })
    saveConversations(conversations)
  },

  updateMessage: (conversationId, messageId, updates) => {
    const conversations = get().conversations.map((c) => {
      if (c.id !== conversationId) return c
      const messages = c.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      )
      return { ...c, messages, updatedAt: Date.now() }
    })
    set({ conversations })
    saveConversations(conversations)
  },

  deleteMessage: (conversationId, messageId) => {
    const conversations = get().conversations.map((c) => {
      if (c.id !== conversationId) return c
      return { ...c, messages: c.messages.filter((m) => m.id !== messageId), updatedAt: Date.now() }
    })
    set({ conversations })
    saveConversations(conversations)
  },

  clearConversations: () => {
    set({ conversations: [], activeConversationId: null })
    saveConversations([])
    saveActiveId(null)
  },
}))
