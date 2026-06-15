import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DreamBook, Interaction } from '@/types'
import { generateId, now } from '@/lib/utils'

interface ExploreState {
  books: DreamBook[]
  interactions: Record<string, Interaction[]>
  loading: boolean

  // 操作
  setBooks: (books: DreamBook[]) => void
  addLike: (bookId: string, nickname: string) => void
  removeLike: (bookId: string, interactionId: string) => void
  addComment: (bookId: string, nickname: string, content: string) => void
  getInteractions: (bookId: string) => Interaction[]
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set, get) => ({
      books: [],
      interactions: {},
      loading: false,

      setBooks: (books) => set({ books }),

      addLike: (bookId, nickname) => {
        const interaction: Interaction = {
          id: generateId(),
          bookId,
          nickname,
          type: 'like',
          createdAt: now(),
        }
        set((s) => ({
          interactions: {
            ...s.interactions,
            [bookId]: [...(s.interactions[bookId] || []), interaction],
          },
        }))
      },

      removeLike: (bookId, interactionId) => {
        set((s) => ({
          interactions: {
            ...s.interactions,
            [bookId]: (s.interactions[bookId] || []).filter((i) => i.id !== interactionId),
          },
        }))
      },

      addComment: (bookId, nickname, content) => {
        const interaction: Interaction = {
          id: generateId(),
          bookId,
          nickname,
          type: 'comment',
          content,
          createdAt: now(),
        }
        set((s) => ({
          interactions: {
            ...s.interactions,
            [bookId]: [...(s.interactions[bookId] || []), interaction],
          },
        }))
      },

      getInteractions: (bookId) => {
        return get().interactions[bookId] || []
      },
    }),
    { name: 'mydreambook-explore' }
  )
)
