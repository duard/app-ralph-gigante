import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export type PeriodoPreset = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'custom';
export type StatusFilter = 'all' | 'active' | 'inactive';
export type EstoqueFilter = 'all' | 'com' | 'sem' | 'critico';

export interface DashboardFilters {
  // Filtros de seleção
  grupos: number[];
  locais: number[];

  // Filtros de período
  periodoPreset: PeriodoPreset;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)

  // Filtros de status
  status: StatusFilter;
  estoqueStatus: EstoqueFilter;

  // Busca textual
  search: string;
}

interface DashboardFiltersStore extends DashboardFilters {
  // Actions
  setGrupos: (grupos: number[]) => void;
  setLocais: (locais: number[]) => void;
  setPeriodoPreset: (preset: PeriodoPreset) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setStatus: (status: StatusFilter) => void;
  setEstoqueStatus: (estoqueStatus: EstoqueFilter) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  getActiveFiltersCount: () => number;
}

// Função helper para calcular datas baseadas no preset
function calculatePresetDates(preset: PeriodoPreset): { startDate: string; endDate: string } {
  const today = new Date();
  const end = endOfDay(today);
  let start: Date;

  switch (preset) {
    case 'hoje':
      start = startOfDay(today);
      break;
    case 'semana':
      start = startOfDay(subDays(today, 7));
      break;
    case 'mes':
      start = startOfDay(subDays(today, 30));
      break;
    case 'trimestre':
      start = startOfDay(subDays(today, 90));
      break;
    case 'ano':
      start = startOfDay(subDays(today, 365));
      break;
    case 'custom':
      // Para custom, retorna o último mês como padrão
      start = startOfDay(subDays(today, 30));
      break;
  }

  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

// Estado inicial
const initialState: DashboardFilters = {
  grupos: [],
  locais: [],
  periodoPreset: 'mes',
  ...calculatePresetDates('mes'),
  status: 'active',
  estoqueStatus: 'all',
  search: '',
};

export const useDashboardFiltersStore = create<DashboardFiltersStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setGrupos: (grupos) => set({ grupos }),

      setLocais: (locais) => set({ locais }),

      setPeriodoPreset: (preset) => {
        const dates = calculatePresetDates(preset);
        set({
          periodoPreset: preset,
          startDate: dates.startDate,
          endDate: dates.endDate,
        });
      },

      setDateRange: (startDate, endDate) =>
        set({
          periodoPreset: 'custom',
          startDate,
          endDate,
        }),

      setStatus: (status) => set({ status }),

      setEstoqueStatus: (estoqueStatus) => set({ estoqueStatus }),

      setSearch: (search) => set({ search }),

      clearFilters: () => {
        const defaults = calculatePresetDates('mes');
        set({
          grupos: [],
          locais: [],
          periodoPreset: 'mes',
          startDate: defaults.startDate,
          endDate: defaults.endDate,
          status: 'active',
          estoqueStatus: 'all',
          search: '',
        });
      },

      getActiveFiltersCount: () => {
        const state = get();
        let count = 0;

        if (state.grupos.length > 0) count++;
        if (state.locais.length > 0) count++;
        if (state.periodoPreset !== 'mes') count++; // Default é mês
        if (state.status !== 'active') count++; // Default é active
        if (state.estoqueStatus !== 'all') count++; // Default é all
        if (state.search.length > 0) count++;

        return count;
      },
    }),
    {
      name: 'dashboard-filters-storage',
      // Apenas persistir alguns campos (não persistir datas para sempre buscar dados atuais)
      partialize: (state) => ({
        grupos: state.grupos,
        locais: state.locais,
        periodoPreset: state.periodoPreset,
        status: state.status,
        estoqueStatus: state.estoqueStatus,
      }),
    }
  )
);
