import type { ProductFilters } from '@/stores/products-store';

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: ProductFilters;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterPresetsStore {
  presets: FilterPreset[];
  savePreset: (preset: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loadPreset: (id: string) => ProductFilters | null;
  deletePreset: (id: string) => void;
  getPresets: () => FilterPreset[];
  updatePreset: (
    id: string,
    updates: Partial<Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt'>>
  ) => void;
}

const PRESETS_STORAGE_KEY = 'product-filter-presets';

export function createFilterPresetsStore(): FilterPresetsStore {
  // Load presets from localStorage
  const loadPresets = (): FilterPreset[] => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((preset: any) => ({
        ...preset,
        createdAt: new Date(preset.createdAt),
        updatedAt: new Date(preset.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading filter presets:', error);
      return [];
    }
  };

  // Save presets to localStorage
  const savePresets = (presets: FilterPreset[]): void => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving filter presets:', error);
    }
  };

  let presets = loadPresets();

  return {
    get presets() {
      return presets;
    },

    savePreset(presetData) {
      const newPreset: FilterPreset = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...presetData,
      };

      presets.push(newPreset);
      savePresets(presets);
    },

    loadPreset(id) {
      const preset = presets.find((p) => p.id === id);
      return preset ? { ...preset.filters } : null;
    },

    deletePreset(id) {
      presets = presets.filter((p) => p.id !== id);
      savePresets(presets);
    },

    getPresets() {
      return [...presets];
    },

    updatePreset(id, updates) {
      const index = presets.findIndex((p) => p.id === id);
      if (index !== -1) {
        presets[index] = {
          ...presets[index],
          ...updates,
          updatedAt: new Date(),
        };
        savePresets(presets);
      }
    },
  };
}

// Singleton instance
export const filterPresetsStore = createFilterPresetsStore();
