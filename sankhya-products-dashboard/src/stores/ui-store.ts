import { create } from 'zustand';

/**
 * UI state for global UI management
 */
interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  modals: Record<string, boolean>;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Mobile detection
  isMobile: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setIsMobile: (isMobile: boolean) => void;
}

/**
 * UI Store for managing global UI state
 */
export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {},
  globalLoading: false,
  loadingMessage: null,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    })),

  closeModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: false },
    })),

  toggleModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: !state.modals[modalId] },
    })),

  closeAllModals: () => set({ modals: {} }),

  setGlobalLoading: (loading, message) =>
    set({
      globalLoading: loading,
      loadingMessage: loading ? message || null : null,
    }),

  setIsMobile: (isMobile) => set({ isMobile }),
}));

// Initialize mobile detection on client
if (typeof window !== 'undefined') {
  const handleResize = () => {
    useUIStore.getState().setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener('resize', handleResize);
}
