import type { SearchableEntry } from './types';

export function filterSearchIndex(
  entries: SearchableEntry[],
  query: string,
): SearchableEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return [];
  }

  return entries.filter(
    entry =>
      entry.title.toLowerCase().includes(trimmed) ||
      entry.subtitle.toLowerCase().includes(trimmed),
  );
}
