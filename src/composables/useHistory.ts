import { ref, type Ref } from 'vue';
import { HISTORY_STORAGE_KEY, PRESET_DOURADOS } from '../data/presets';
import type { AnalysisHistoryItem, BusinessProfile } from '../types';
import { calculateProfileScore } from '../utils/scoring';

function formatAnalyzedAt(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function createInitialHistory(): AnalysisHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (parsed as AnalysisHistoryItem[]).slice(0, 5);
      }
    }
  } catch (e) {
    console.warn('Erro ao ler histórico de consultas:', e);
  }

  return [
    {
      id: 'hist-preset-dourados',
      name: PRESET_DOURADOS.name,
      city: PRESET_DOURADOS.city,
      category: PRESET_DOURADOS.category,
      score: calculateProfileScore(PRESET_DOURADOS),
      analyzedAt: formatAnalyzedAt(new Date()),
      timestamp: Date.now(),
      url: PRESET_DOURADOS.url,
      profile: PRESET_DOURADOS,
    },
  ];
}

export function useHistory(inputUrl: Ref<string>) {
  const history = ref<AnalysisHistoryItem[]>(createInitialHistory());

  function persist(items: AnalysisHistoryItem[]): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Falha ao salvar histórico no localStorage:', err);
    }
  }

  function save(targetProfile: BusinessProfile, explicitScore?: number): void {
    const finalScore = explicitScore ?? calculateProfileScore(targetProfile);
    const now = new Date();

    const newItem: AnalysisHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: targetProfile.name,
      city: targetProfile.city,
      category: targetProfile.category,
      score: finalScore,
      analyzedAt: formatAnalyzedAt(now),
      timestamp: Date.now(),
      url: targetProfile.url || inputUrl.value,
      profile: structuredClone(targetProfile),
    };

    const filtered = history.value.filter(
      (item) =>
        item.name.toLowerCase() !== targetProfile.name.toLowerCase() &&
        item.url !== newItem.url
    );
    const updated = [newItem, ...filtered].slice(0, 5);
    history.value = updated;
    persist(updated);
  }

  function remove(id: string): void {
    const updated = history.value.filter((item) => item.id !== id);
    history.value = updated;
    persist(updated);
  }

  function clear(): void {
    history.value = [];
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (err) {
      console.warn('Falha ao limpar histórico:', err);
    }
  }

  return { history, save, remove, clear };
}
