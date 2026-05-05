// src/utils/format.ts

/**
 * Formats a slug-like string into a display name.
 * Example: "core-ai-news" -> "Core AI News"
 * - Replaces hyphens with spaces
 * - Capitalizes every word
 * - Ensures "AI" is always fully uppercase
 */
export function formatCategoryName(name: string): string {
  if (!name) return "";

  return name
    .split("-")
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper === "AI") return "AI";
      
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
