/**
 * Convert kebab-case ID to readable title
 * Example: "core-ai-news" -> "Core AI News"
 */
export const formatId = (id?: string) => {
  if (!id) return '';
  return id
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
};
/**
 * Format a long title to a readable substring with ellipsis
 */
export function formatTitle(title: string, maxLength: number = 80): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength).trim() + '...';
}

/**
 * Format a long description to a readable substring with ellipsis
 */
export function formatDescription(
  description: string,
  maxLines: number = 3,
): string {
  const lines = description.split('\n');
  if (lines.length <= maxLines) return description;

  const truncated = lines.slice(0, maxLines).join('\n').trim();
  if (truncated.length > 200) {
    return truncated.substring(0, 200).trim() + '...';
  }
  return truncated + '...';
}

/**
 * Generate a color based on category ID
 */
export function getCategoryColor(
  categoryId: string | null,
): 'blue' | 'purple' | 'green' | 'amber' | 'pink' {
  const colors: Record<string, 'blue' | 'purple' | 'green' | 'amber' | 'pink'> =
    {
      'core-ai-news': 'blue',
      'technical-ai': 'purple',
      'developer-tools': 'green',
      sectors: 'amber',
    };

  return colors[categoryId || ''] || 'blue';
}

/**
 * Get color classes based on category color
 */
export function getCategoryColorClasses(
  color: 'blue' | 'purple' | 'green' | 'amber' | 'pink',
) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-600/20',
      border: 'border-blue-600/50',
      text: 'text-blue-300',
    },
    purple: {
      bg: 'bg-purple-600/20',
      border: 'border-purple-600/50',
      text: 'text-purple-300',
    },
    green: {
      bg: 'bg-green-600/20',
      border: 'border-green-600/50',
      text: 'text-green-300',
    },
    amber: {
      bg: 'bg-amber-600/20',
      border: 'border-amber-600/50',
      text: 'text-amber-300',
    },
    pink: {
      bg: 'bg-pink-600/20',
      border: 'border-pink-600/50',
      text: 'text-pink-300',
    },
  };

  return colorMap[color];
}
