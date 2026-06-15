import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DreamBook, StyleTemplate } from '@/types'
import { generateId, now } from '@/lib/utils'

interface BookState {
  books: DreamBook[]
  currentBookId: string | null
  loading: boolean

  // 操作
  createBook: (title: string, style?: StyleTemplate) => DreamBook
  updateBook: (id: string, updates: Partial<DreamBook>) => void
  deleteBook: (id: string) => void
  setCurrentBook: (id: string | null) => void
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [],
      currentBookId: null,
      loading: false,

      createBook: (title, style = 'light') => {
        const book: DreamBook = {
          id: generateId(),
          title,
          style,
          pageFlipMode: '3d',
          isPublic: true,
          createdAt: now(),
          updatedAt: now(),
        }
        set((s) => ({ books: [...s.books, book], currentBookId: book.id }))
        return book
      },

      updateBook: (id, updates) => {
        set((s) => ({
          books: s.books.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: now() } : b
          ),
        }))
      },

      deleteBook: (id) => {
        set((s) => ({
          books: s.books.filter((b) => b.id !== id),
          currentBookId: s.currentBookId === id ? null : s.currentBookId,
        }))
      },

      setCurrentBook: (id) => set({ currentBookId: id }),
    }),
    { name: 'mydreambook-books' }
  )
)
