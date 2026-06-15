import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Page, PageElement, EditorSnapshot } from '@/types'
import { generateId, now } from '@/lib/utils'

interface EditorState {
  pages: Page[]
  currentPage: number
  selectedElements: string[]
  undoStack: EditorSnapshot[]
  redoStack: EditorSnapshot[]

  // 页面
  addPage: (bookId: string) => void
  removePage: (pageId: string) => void
  setCurrentPage: (pageNum: number) => void
  loadPages: (pages: Page[]) => void
  getCurrentPage: () => Page | undefined

  // 元素
  addElement: (pageNum: number, element: PageElement) => void
  updateElement: (pageNum: number, elementId: string, changes: Partial<PageElement>) => void
  removeElement: (pageNum: number, elementId: string) => void
  selectElement: (elementId: string) => void
  clearSelection: () => void

  // 撤销/重做
  pushUndo: (snapshot: EditorSnapshot) => void
  undo: () => void
  redo: () => void
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      pages: [],
      currentPage: 0,
      selectedElements: [],
      undoStack: [],
      redoStack: [],

      addPage: (bookId) => {
        // 使用书内局部页码，而非全局页数
        const bookPageCount = get().pages.filter((p) => p.bookId === bookId).length
        const page: Page = {
          id: generateId(),
          bookId,
          pageNumber: bookPageCount,
          content: { elements: [] },
          createdAt: now(),
          updatedAt: now(),
        }
        set((s) => ({ pages: [...s.pages, page], currentPage: bookPageCount }))
      },

      removePage: (pageId) => {
        set((s) => {
          const pages = s.pages.filter((p) => p.id !== pageId)
          return {
            pages,
            currentPage: Math.min(s.currentPage, pages.length - 1),
          }
        })
      },

      setCurrentPage: (pageNum) => set({ currentPage: pageNum }),

      loadPages: (pages) => set({ pages, currentPage: 0 }),

      getCurrentPage: () => {
        const { pages, currentPage } = get()
        return pages[currentPage]
      },

      addElement: (pageNum, element) => {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.pageNumber === pageNum
              ? { ...p, content: { elements: [...p.content.elements, element] }, updatedAt: now() }
              : p
          ),
        }))
      },

      updateElement: (pageNum, elementId, changes) => {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.pageNumber === pageNum
              ? {
                  ...p,
                  content: {
                    elements: p.content.elements.map((el) =>
                      el.id === elementId ? { ...el, ...changes } : el
                    ),
                  },
                  updatedAt: now(),
                }
              : p
          ),
        }))
      },

      removeElement: (pageNum, elementId) => {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.pageNumber === pageNum
              ? {
                  ...p,
                  content: { elements: p.content.elements.filter((el) => el.id !== elementId) },
                  updatedAt: now(),
                }
              : p
          ),
        }))
      },

      selectElement: (elementId) => set({ selectedElements: [elementId] }),
      clearSelection: () => set({ selectedElements: [] }),

      pushUndo: (snapshot) => {
        set((s) => ({ undoStack: [...s.undoStack, snapshot], redoStack: [] }))
      },

      undo: () => {
        const { undoStack, pages, currentPage } = get()
        if (undoStack.length === 0) return
        const snapshot = undoStack[undoStack.length - 1]
        const currentSnapshot: EditorSnapshot = {
          elements: [...(pages[currentPage]?.content.elements || [])],
        }
        set((s) => ({
          undoStack: s.undoStack.slice(0, -1),
          redoStack: [...s.redoStack, currentSnapshot],
          pages: s.pages.map((p) =>
            p.pageNumber === currentPage
              ? { ...p, content: { elements: snapshot.elements }, updatedAt: now() }
              : p
          ),
        }))
      },

      redo: () => {
        const { redoStack, pages, currentPage } = get()
        if (redoStack.length === 0) return
        const snapshot = redoStack[redoStack.length - 1]
        const currentSnapshot: EditorSnapshot = {
          elements: [...(pages[currentPage]?.content.elements || [])],
        }
        set((s) => ({
          redoStack: s.redoStack.slice(0, -1),
          undoStack: [...s.undoStack, currentSnapshot],
          pages: s.pages.map((p) =>
            p.pageNumber === currentPage
              ? { ...p, content: { elements: snapshot.elements }, updatedAt: now() }
              : p
          ),
        }))
      },
    }),
    { name: 'mydreambook-editor' }
  )
)
