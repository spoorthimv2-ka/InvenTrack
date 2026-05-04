import { create } from "zustand";
import type { Order, PaginationState, TableSort, OrderStatus } from "@/types";

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  statusFilter: OrderStatus | "";
  sort: TableSort;
  pagination: PaginationState;

  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStatusFilter: (status: OrderStatus | "") => void;
  setSort: (sort: TableSort) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;

  // ── Realtime patch operations ──────────────────────────
  patchOrder: (id: string, patch: Partial<Order>) => void;
  insertOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
}

const defaultPagination: PaginationState = { page: 1, pageSize: 20, total: 0 };

export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  statusFilter: "",
  sort: { column: "created_at", direction: "desc" },
  pagination: defaultPagination,

  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setStatusFilter: (statusFilter) =>
    set({ statusFilter, pagination: { ...defaultPagination } }),
  setSort: (sort) => set({ sort }),
  setPagination: (partial) =>
    set((s) => ({ pagination: { ...s.pagination, ...partial } })),

  patchOrder: (id, patch) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),

  insertOrder: (order) =>
    set((s) => ({
      orders: [order, ...s.orders],
      pagination: { ...s.pagination, total: s.pagination.total + 1 },
    })),

  removeOrder: (id) =>
    set((s) => ({
      orders: s.orders.filter((o) => o.id !== id),
      pagination: { ...s.pagination, total: Math.max(0, s.pagination.total - 1) },
    })),
}));
