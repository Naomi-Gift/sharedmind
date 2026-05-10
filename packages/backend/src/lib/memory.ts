import { MemoryEntry } from '../types';

const store: MemoryEntry[] = [];

export function addEntry(entry: MemoryEntry): void {
  store.push(entry);
}

export function searchMemory(query: string, topK = 5): MemoryEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
  if (terms.length === 0) return store.slice(-topK);

  const scored = store.map(entry => {
    const text = `${entry.prompt} ${entry.response}`.toLowerCase();
    const score = terms.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
    return { ...entry, score };
  });

  return scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function getRecentEntries(n = 20): MemoryEntry[] {
  return store.slice(-n).reverse();
}

export function getStats() {
  return {
    totalEntries: store.length,
    uniqueMembers: new Set(store.map(e => e.member)).size,
    models: store.reduce<Record<string, number>>((acc, e) => {
      acc[e.model] = (acc[e.model] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
