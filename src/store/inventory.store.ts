import { create } from "zustand";
import type { Product, PaginationState, TableSort } from "@/types";
import { deriveProductStatus } from "@/types";

interface InventoryState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  search: string;
  categoryFilter: string;
  activeFilter: "all" | "active" | "inactive";
  sort: TableSort;
  pagination: PaginationState;

  // ── Setters ────────────────────────────────────────────
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setCategoryFilter: (category: string) => void;
  setActiveFilter: (filter: "all" | "active" | "inactive") => void;
  setSort: (sort: TableSort) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  // ── Realtime patch operations (no full reload) ─────────
  /** Update a single product's stock_quantity in-place */
  updateStock: (id: string, qty: number) => void;
  /** Merge any partial product fields into the matching list item */
  patchProduct: (id: string, patch: Partial<Product>) => void;
  /** Insert a newly-created product into the top of the list */
  insertProduct: (product: Product) => void;
  /** Remove a deleted product from the list */
  removeProduct: (id: string) => void;

  reset: () => void;
}

const defaultPagination: PaginationState = { page: 1, pageSize: 20, total: 0 };

export const useInventoryStore = create<InventoryState>()((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  search: "",
  categoryFilter: "",
  activeFilter: "active",
  sort: { column: "created_at", direction: "desc" },
  pagination: defaultPagination,

  setProducts: (products) => set({ products }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearch: (search) => set({ search, pagination: { ...defaultPagination } }),
  setCategoryFilter: (categoryFilter) =>
    set({ categoryFilter, pagination: { ...defaultPagination } }),
  setActiveFilter: (activeFilter) =>
    set({ activeFilter, pagination: { ...defaultPagination } }),
  setSort: (sort) => set({ sort }),
  setPagination: (partial) =>
    set((s) => ({ pagination: { ...s.pagination, ...partial } })),

  // ── Efficient realtime patches ─────────────────────────

  updateStock: (id, qty) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === id
          ? { ...p, stock_quantity: qty, status: deriveProductStatus({ ...p, stock_quantity: qty }) }
          : p
      ),
    })),

  patchProduct: (id, patch) =>
    set((s) => ({
      products: s.products.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch };
        return { ...merged, status: deriveProductStatus(merged) };
      }),
    })),

  insertProduct: (product) =>
    set((s) => ({
      products: [{ ...product, status: deriveProductStatus(product) }, ...s.products],
      pagination: { ...s.pagination, total: s.pagination.total + 1 },
    })),

  removeProduct: (id) =>
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
      pagination: { ...s.pagination, total: Math.max(0, s.pagination.total - 1) },
    })),

  reset: () =>
    set({
      products: [],
      selectedProduct: null,
      isLoading: false,
      error: null,
      search: "",
      categoryFilter: "",
      activeFilter: "active",
      sort: { column: "created_at", direction: "desc" },
      pagination: defaultPagination,
    }),
}));
