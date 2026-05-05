// src/store/categoryStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Category } from '@/types/news.types'

interface CategoryState {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  clearCategories: () => void
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      categories: [],
      setCategories: (categories) => set({ categories }),
      clearCategories: () => set({ categories: [] }),
    }),
    {
      name: 'news-categories-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
)
