import { create } from 'zustand';

interface ProductFilters {
  search: string;
  category: string;
  stockStatus: string[];
  sortBy: string;
  sortOrder: string;
}

interface OrderFilters {
  status: string[];
  startDate: string;
  endDate: string;
}

interface AnalyticsFilters {
  startDate: string;
  endDate: string;
}

interface UIState {
  sidebarOpen: boolean;
  productFilters: ProductFilters;
  orderFilters: OrderFilters;
  analyticsFilters: AnalyticsFilters;
  selectedProducts: string[];
  expandedOrderId: string | null;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' }>;
  
  setSidebarOpen: (open: boolean) => void;
  setProductFilters: (filters: Partial<ProductFilters>) => void;
  setOrderFilters: (filters: Partial<OrderFilters>) => void;
  setAnalyticsFilters: (filters: Partial<AnalyticsFilters>) => void;
  setSelectedProducts: (ids: string[]) => void;
  toggleProductSelection: (id: string) => void;
  setExpandedOrderId: (id: string | null) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  productFilters: {
    search: '',
    category: '',
    stockStatus: [],
    sortBy: 'name',
    sortOrder: 'asc',
  },
  orderFilters: {
    status: [],
    startDate: '',
    endDate: '',
  },
  analyticsFilters: {
    startDate: '',
    endDate: '',
  },
  selectedProducts: [],
  expandedOrderId: null,
  toasts: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setProductFilters: (filters) =>
    set((state) => ({
      productFilters: { ...state.productFilters, ...filters },
    })),
  
  setOrderFilters: (filters) =>
    set((state) => ({
      orderFilters: { ...state.orderFilters, ...filters },
    })),
  
  setAnalyticsFilters: (filters) =>
    set((state) => ({
      analyticsFilters: { ...state.analyticsFilters, ...filters },
    })),
  
  setSelectedProducts: (ids) => set({ selectedProducts: ids }),
  
  toggleProductSelection: (id) =>
    set((state) => ({
      selectedProducts: state.selectedProducts.includes(id)
        ? state.selectedProducts.filter((p) => p !== id)
        : [...state.selectedProducts, id],
    })),
  
  setExpandedOrderId: (id) => set({ expandedOrderId: id }),
  
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));