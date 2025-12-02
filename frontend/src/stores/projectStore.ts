import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PromptRecord {
  id: string
  original: string
  optimized?: string
  createdAt: string
}

interface OutlineRecord {
  id: string
  bookTitle: string
  refinedPrompt: string
  totalChapters: number
  chapters: any[]
  createdAt: string
}

interface BookRecord {
  id: string
  outlineId: string
  title: string
  chapters: any[]
  createdAt: string
}

interface AgentConfig {
  llmProvider: string
  model: string
  temperature?: number
  maxTokens?: number
}

interface ProjectStore {
  prompts: PromptRecord[]
  outlines: OutlineRecord[]
  books: BookRecord[]
  agentConfig: AgentConfig | null
  addPrompt: (prompt: Omit<PromptRecord, 'id' | 'createdAt'>) => void
  addOutline: (outline: Omit<OutlineRecord, 'id' | 'createdAt'>) => void
  addBook: (book: Omit<BookRecord, 'id' | 'createdAt'>) => void
  updatePromptOptimized: (id: string, optimized: string) => void
  setAgentConfig: (config: AgentConfig) => void
  clearAll: () => void
}

export const useProject = create<ProjectStore>()(
  persist(
    (set) => ({
      prompts: [],
      outlines: [],
      books: [],
      agentConfig: null,

      addPrompt: (prompt) => {
        const newPrompt: PromptRecord = {
          ...prompt,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ prompts: [...state.prompts, newPrompt] }))
      },

      addOutline: (outline) => {
        const newOutline: OutlineRecord = {
          ...outline,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ outlines: [...state.outlines, newOutline] }))
      },

      addBook: (book) => {
        const newBook: BookRecord = {
          ...book,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ books: [...state.books, newBook] }))
      },

      updatePromptOptimized: (id, optimized) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, optimized } : p
          ),
        }))
      },

      setAgentConfig: (config) => set({ agentConfig: config }),

      clearAll: () => set({ prompts: [], outlines: [], books: [], agentConfig: null }),
    }),
    {
      name: 'project-storage',
    }
  )
)
