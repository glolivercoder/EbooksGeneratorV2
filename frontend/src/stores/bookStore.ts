import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Chapter {
  number: number
  title: string
  description: string
  key_topics: string[]
  estimated_pages: number
  content?: string
  topics_data?: any[] // Persistência dos tópicos do ChapterScopeEnhanced
}

export interface BookData {
  id?: string
  title: string
  description: string
  optimized_prompt: string
  total_chapters: number
  chapters: Chapter[]
  created_at: string
  last_modified: string
  last_saved?: string
  status: 'draft' | 'in_progress' | 'completed'
}

interface BookStore {
  // Estado atual
  currentBook: BookData | null
  isDirty: boolean
  isSaving: boolean
  autoSaveEnabled: boolean

  // Biblioteca de livros salvos
  savedBooks: BookData[]
  fetchLibrary: () => Promise<void>
  saveToLibrary: () => Promise<void>
  deleteFromLibrary: (id: string) => Promise<void>
  loadFromLibrary: (id: string) => Promise<void>

  // Actions
  setCurrentBook: (book: BookData) => void
  updateBookTitle: (title: string) => void
  updateBookDescription: (description: string) => void
  updateChapter: (chapterNumber: number, updates: Partial<Chapter>) => void
  updateChapterContent: (chapterNumber: number, content: string) => void
  addChapter: (chapter: Chapter) => void
  removeChapter: (chapterNumber: number) => void
  reorderChapters: (fromIndex: number, toIndex: number) => void
  markDirty: () => void
  markClean: () => void
  clearCurrentBook: () => void
  setBookStatus: (status: BookData['status']) => void
  updateOutline: (outline: Partial<BookData>) => void
  enableAutoSave: () => void
  disableAutoSave: () => void
  setIsSaving: (saving: boolean) => void
  markSaved: () => void
  getChapter: (chapterNumber: number) => Chapter | undefined
  getTotalPages: () => number
  getSaveStatus: () => 'no-book' | 'saving' | 'unsaved' | 'saved'
  exportBook: () => BookData
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentBook: null,
      savedBooks: [], // Inicializar vazio
      isDirty: false,
      isSaving: false,
      autoSaveEnabled: true,

      // Ações
      setCurrentBook: (book) => {
        set({
          currentBook: {
            ...book,
            last_modified: new Date().toISOString(),
            status: 'in_progress'
          },
          isDirty: false
        })
      },

      updateBookTitle: (title) => {
        const { currentBook } = get()
        if (currentBook) {
          set({
            currentBook: {
              ...currentBook,
              title,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      updateBookDescription: (description) => {
        const { currentBook } = get()
        if (currentBook) {
          set({
            currentBook: {
              ...currentBook,
              description,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      updateChapter: (chapterNumber, updates) => {
        const { currentBook } = get()
        if (currentBook) {
          const updatedChapters = currentBook.chapters.map(chapter =>
            chapter.number === chapterNumber
              ? { ...chapter, ...updates }
              : chapter
          )

          set({
            currentBook: {
              ...currentBook,
              chapters: updatedChapters,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      updateChapterContent: (chapterNumber, content) => {
        const { currentBook } = get()
        if (currentBook) {
          const updatedChapters = currentBook.chapters.map(chapter =>
            chapter.number === chapterNumber
              ? { ...chapter, content }
              : chapter
          )

          set({
            currentBook: {
              ...currentBook,
              chapters: updatedChapters,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      addChapter: (chapter) => {
        const { currentBook } = get()
        if (currentBook) {
          const updatedChapters = [...currentBook.chapters, chapter]
          set({
            currentBook: {
              ...currentBook,
              chapters: updatedChapters,
              total_chapters: updatedChapters.length,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      removeChapter: (chapterNumber) => {
        const { currentBook } = get()
        if (currentBook) {
          const updatedChapters = currentBook.chapters
            .filter(chapter => chapter.number !== chapterNumber)
            .map((chapter, index) => ({
              ...chapter,
              number: index + 1
            }))

          set({
            currentBook: {
              ...currentBook,
              chapters: updatedChapters,
              total_chapters: updatedChapters.length,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      reorderChapters: (fromIndex, toIndex) => {
        const { currentBook } = get()
        if (currentBook) {
          const updatedChapters = [...currentBook.chapters]
          const [movedChapter] = updatedChapters.splice(fromIndex, 1)
          updatedChapters.splice(toIndex, 0, movedChapter)

          // Re-numerar capítulos
          const renumberedChapters = updatedChapters.map((chapter, index) => ({
            ...chapter,
            number: index + 1
          }))

          set({
            currentBook: {
              ...currentBook,
              chapters: renumberedChapters,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      markDirty: () => set({ isDirty: true }),

      markClean: () => set({ isDirty: false }),

      clearCurrentBook: () => set({
        currentBook: null,
        isDirty: false
      }),

      setBookStatus: (status) => {
        const { currentBook } = get()
        if (currentBook) {
          set({
            currentBook: {
              ...currentBook,
              status,
              last_modified: new Date().toISOString()
            },
            isDirty: true
          })
        }
      },

      // Auto-save
      updateOutline: (outline) => {
        const { currentBook, autoSaveEnabled } = get()
        if (!autoSaveEnabled) return

        const now = new Date().toISOString()
        const updatedBook = currentBook ? {
          ...currentBook,
          ...outline,
          last_modified: now,
          last_saved: now
        } : {
          id: outline.id || crypto.randomUUID(),
          title: outline.title || 'Novo Livro',
          description: outline.description || '',
          optimized_prompt: outline.optimized_prompt || '',
          total_chapters: outline.total_chapters || 0,
          chapters: outline.chapters || [],
          created_at: outline.created_at || now,
          last_modified: now,
          last_saved: now,
          status: 'in_progress' as const
        }

        set({
          currentBook: updatedBook,
          isDirty: false
        })
      },

      enableAutoSave: () => set({ autoSaveEnabled: true }),

      disableAutoSave: () => set({ autoSaveEnabled: false }),

      setIsSaving: (saving) => set({ isSaving: saving }),

      markSaved: () => {
        const { currentBook } = get()
        if (currentBook) {
          set({
            currentBook: {
              ...currentBook,
              last_saved: new Date().toISOString()
            },
            isDirty: false,
            isSaving: false
          })
          // Também salvar na biblioteca automaticamente
          get().saveToLibrary()
        }
      },

      // Library Actions (Backend Persistence)
      fetchLibrary: async () => {
        try {
          const response = await fetch('http://localhost:8000/api/library/books')
          const data = await response.json()
          if (data.status === 'success') {
            set({ savedBooks: data.books })
          }
        } catch (error) {
          console.error('Erro ao buscar biblioteca:', error)
        }
      },

      saveToLibrary: async () => {
        const { currentBook } = get()
        if (!currentBook) return

        // Formatar título: Prompt - Data Hora
        const date = new Date()
        const formattedDate = date.toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }).replace(',', '')

        // Usar optimized_prompt ou title como base
        const baseTitle = currentBook.optimized_prompt
          ? (currentBook.optimized_prompt.length > 30 ? currentBook.optimized_prompt.substring(0, 30) + '...' : currentBook.optimized_prompt)
          : currentBook.title

        const newTitle = `${baseTitle} - ${formattedDate}`

        const bookToSave = {
          ...currentBook,
          title: newTitle,
          last_saved: new Date().toISOString()
        }

        try {
          set({ isSaving: true })
          const response = await fetch('http://localhost:8000/api/library/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookToSave)
          })

          const data = await response.json()

          if (data.status === 'success') {
            // Atualizar lista local após salvar
            await get().fetchLibrary()

            set({
              currentBook: bookToSave,
              isDirty: false,
              isSaving: false
            })
            console.log('Livro salvo no backend:', data.book_id)
          } else {
            console.error('Erro ao salvar no backend:', data.error)
            set({ isSaving: false })
          }
        } catch (error) {
          console.error('Erro de conexão ao salvar:', error)
          set({ isSaving: false })
        }
      },

      deleteFromLibrary: async (id) => {
        try {
          const response = await fetch(`http://localhost:8000/api/library/books/${id}`, {
            method: 'DELETE'
          })
          const data = await response.json()

          if (data.status === 'success') {
            // Atualizar lista local
            await get().fetchLibrary()
          }
        } catch (error) {
          console.error('Erro ao deletar do backend:', error)
        }
      },

      loadFromLibrary: async (id) => {
        try {
          const response = await fetch(`http://localhost:8000/api/library/books/${id}`)
          const data = await response.json()

          if (data.status === 'success' && data.book) {
            set({
              currentBook: data.book,
              isDirty: false
            })
            console.log('Livro carregado do backend:', data.book.title)
          }
        } catch (error) {
          console.error('Erro ao carregar do backend:', error)
        }
      },

      // Utilitários
      getChapter: (chapterNumber) => {
        const { currentBook } = get()
        return currentBook?.chapters.find(chapter => chapter.number === chapterNumber)
      },

      getTotalPages: () => {
        const { currentBook } = get()
        return currentBook?.chapters.reduce((total, chapter) => total + (chapter.estimated_pages || 0), 0) || 0
      },

      getSaveStatus: () => {
        const { currentBook, isSaving, isDirty } = get()
        if (!currentBook) return 'no-book'
        if (isSaving) return 'saving'
        if (isDirty) return 'unsaved'
        return 'saved'
      },

      exportBook: () => {
        const { currentBook } = get()
        if (!currentBook) throw new Error('Nenhum livro carregado')

        return {
          ...currentBook,
          exported_at: new Date().toISOString()
        }
      }
    }),
    {
      name: 'book-store',
      partialize: (state) => ({
        currentBook: state.currentBook,
        savedBooks: state.savedBooks, // Persistir a biblioteca
        isDirty: state.isDirty,
        autoSaveEnabled: state.autoSaveEnabled
      })
    }
  )
)
