// src/hooks/useNews.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { newsService } from "@/services/news.service";
import { useCategoryStore } from "@/store/categoryStore";
import type {
  SetUserCategoriesPayload,
  UpdateUserCategoriesPayload,
  CreateCustomCategoryPayload,
  CreateCustomSubcategoryPayload,
} from "@/types/news.types";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const newsKeys = {
  all: ["news"] as const,
  categories: () => [...newsKeys.all, "categories"] as const,
  userCategories: () => [...newsKeys.all, "userCategories"] as const,
  todayNews: () => [...newsKeys.all, "today"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** All available categories (no auth required) */
export const useCategories = () => {
  const { setCategories } = useCategoryStore();

  return useQuery({
    // This defines the key for the cache.
    queryKey: newsKeys.categories(),
    queryFn: async () => {
      const res = await newsService.getCategories();
      // make sure the store always has a real array for subcategories;
      // backend may return `null`/`undefined` for legacy/empty cases.
      const normalized = res.data.categories_data.map((c) => ({
        ...c,
        subcategories: c.subcategories ?? [],
      }));
      setCategories(normalized);
      return res.data;
    },
  });
};

/** Categories the currently logged-in user has selected */
export const useUserCategories = () =>
  useQuery({
    queryKey: newsKeys.userCategories(),
    queryFn: async () => {
      const res = await newsService.getUserCategories();
      return res.data;
    },
  });

/** Today's news articles for the user's selected categories */
export const useTodayNews = () =>
  useQuery({
    queryKey: newsKeys.todayNews(),
    queryFn: async () => {
      const res = await newsService.getTodayNews();
      return res.data;
    },
  });



// ─── Mutations ────────────────────────────────────────────────────────────────

export const useSetCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetUserCategoriesPayload) =>
      newsService.setUserCategories(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(newsKeys.userCategories(), res.data);
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to set categories.");
    },
  });
};

export const useUpdateCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserCategoriesPayload) =>
      newsService.updateUserCategories(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(newsKeys.userCategories(), res.data);
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to update categories.",
      );
    },
  });
};

export const useCreateCustomCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomCategoryPayload) =>
      newsService.createCustomCategory(payload),
    onSuccess: (res) => {
      // If we got back the full categories data, update the cache directly
      if ("categories_data" in res.data) {
        queryClient.setQueryData(newsKeys.userCategories(), res.data);
      } else {
        // For other cases (AlreadyExists/SimilarExists), we might still want to refresh
        // but since the component handles the ID mapping, we can just invalidate
        queryClient.invalidateQueries({ queryKey: newsKeys.userCategories() });
      }
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to create category.",
      );
    },
  });
};


export const useDeleteCustomCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => newsService.deleteCustomCategory(categoryId),
    onSuccess: (res) => {
      queryClient.setQueryData(newsKeys.userCategories(), res.data);
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to delete category."
      )
    }
  })
}

export const useCreateCustomSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomSubcategoryPayload) =>
      newsService.createCustomSubcategory(payload),
    onSuccess: (res) => {
      // If we got back the full categories data, update the cache directly
      if ("categories_data" in res.data) {
        queryClient.setQueryData(newsKeys.userCategories(), res.data);
      } else {
        // For other cases (AlreadyExists/SimilarExists), we might still want to refresh
        // but since the component handles the ID mapping, we can just invalidate
        queryClient.invalidateQueries({ queryKey: newsKeys.userCategories() });
      }
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to create subcategory.",
      );
    },
  });
};


export const useDeleteCustomSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subcategoryId: string) => newsService.deleteCustomSubcategory(subcategoryId),
    onSuccess: (res) => {
      queryClient.setQueryData(newsKeys.userCategories(), res.data);
      toast.success(res.message);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to delete subcategory."
      )
    }
  })
}