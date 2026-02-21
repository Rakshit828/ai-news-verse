// src/store/categoryStore.ts
import { create } from 'zustand'
import type { Category } from '@/types/news.types'

interface CategoryState {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  clearCategories: () => void
}

export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  clearCategories: () => set({ categories: [] }),
}))
