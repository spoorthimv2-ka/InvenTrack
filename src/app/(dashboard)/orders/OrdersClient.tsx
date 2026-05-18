"use client";

import { useEffect, useState, useCallback } from "react";

import {
  Plus, RefreshCcw, Clock, CheckCircle, Truck, XCircle,
} from "lucide-react";
import { useOrdersStore }  from "@/store/orders.store";
import { fetchOrders, updateOrderStatus, nextStatuses, canTransition } from "@/lib/api/orders";
import { StatCard }        from "@/components/ui/StatCard";
import { StatusBadge }     from "@/components/ui/StatusBadge";
import { PageLoader }      from "@/components/ui/Loader";
import { Modal }           from "@/components/ui/Modal";
import { useAuth }         from "@/components/providers/AuthProvider";
import { useAuthStore }    from "@/store/auth.store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn }              from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Advance to Processing",
  processing: "Mark Completed",
  completed:  "Completed",
  cancelled:  "Cancelled",
};

export default function OrdersClient() {
  const {
    orders, isLoading, statusFilter, pagination,
    setOrders, setLoading, setStatusFilter, setPagination,
  } = useOrdersStore();

  const { isAdmin } = useAuth();
  const [selected, setSelected] = useState<Order | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newOrderNotes, setNewOrderNotes] = useState<string>("");
  const [newOrderDate, setNewOrderDate] = useState<string>("");

  async function handleCreateOrder() {
    setIsSaving(true);
    try {
      // Generate a simple random order number
      const order_number = "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      // Get the current user's ID
      const user = useAuthStore.getState().user;

      await import("@/lib/api/orders").then(api => 
        api.createOrder({
          order_number,
          created_by: user?.id || null,
          supplier_id: null,
          status: "pending",
          expected_date: newOrderDate || null,
          notes: newOrderNotes || null
        } as unknown as Order)
      );
      setShowAdd(false);
      setNewOrderNotes("");
      setNewOrderDate("");
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setIsSaving(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { orders: data, total } = await fetchOrders({
        status: statusFilter,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setOrders(data);
      setPagination({ total });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter, pagination.page, pagination.pageSize, setOrders, setLoading, setPagination]);

  useEffect(() => { load(); }, [load]);

  const pending    = orders.filter((o) => o.status === "pending").length;
  const processing = orders.filter((o) => o.status === "processing").length;
  const completed  = orders.filter((o) => o.status === "completed").length;
  const cancelled  = orders.filter((o) => o.status === "cancelled").length;

  async function handleTransition(order: Order, to: OrderStatus) {
    if (!canTransition(order.status, to)) return;
    try {
      await updateOrderStatus(order.id, to);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Pending"    value={pending}    icon={Clock}        accent="amber"   />
        <StatCard title="Processing" value={processing} icon={Truck}        accent="blue"    />
        <StatCard title="Completed"  value={completed}  icon={CheckCircle} accent="emerald" />
        <StatCard title="Cancelled"  value={cancelled}  icon={XCircle}      accent="red"     />
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select
          id="orders-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          className="input w-44"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={load} className="btn-secondary" id="orders-refresh">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
        <button onClick={() => setShowAdd(true)} className="btn-primary ml-auto" id="orders-add">
          <Plus className="h-4 w-4" /> New Order
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? <PageLoader /> : (
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Total</th>
                <th>Expected</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
              {orders.map((order) => {
                const nexts = nextStatuses(order.status);
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono text-xs text-brand-400">{order.order_number}</span>
                    </td>
                    <td>{order.supplier?.name ?? "—"}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="font-medium">{formatCurrency(order.total_amount)}</td>
                    <td className="text-slate-500">
                      {order.expected_date ? formatDate(order.expected_date) : "—"}
                    </td>
                    <td className="text-slate-500">{formatDate(order.created_at)}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelected(order)}
                          className="btn-ghost text-xs py-1 px-2"
                        >
                          View
                        </button>
                        {/* Transition buttons — respect DB state machine */}
                        {nexts.map((next) => (
                          <button
                            key={next}
                            onClick={() => handleTransition(order, next)}
                            className={cn(
                              "btn-ghost text-xs py-1 px-2",
                              next === "cancelled" ? "text-red-400" : "text-brand-400"
                            )}
                          >
                            {next === "cancelled" ? "Cancel" : STATUS_LABEL[order.status]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Order ${selected?.order_number ?? ""}`}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Supplier</p>
                <p className="text-slate-200">{selected.supplier?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Status</p>
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Total</p>
                <p className="font-semibold text-slate-200">{formatCurrency(selected.total_amount)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Expected</p>
                <p className="text-slate-200">
                  {selected.expected_date ? formatDate(selected.expected_date) : "—"}
                </p>
              </div>
              {isAdmin && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Created By</p>
                  <p className="text-slate-200">{selected.creator?.full_name ?? selected.creator?.email ?? "—"}</p>
                </div>
              )}
            </div>
            {selected.notes && (
              <div>
                <p className="text-slate-500 text-xs mb-1">Notes</p>
                <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-300">{selected.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Order Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Order">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Order Notes (Optional)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g., Urgent restock" 
              value={newOrderNotes}
              onChange={(e) => setNewOrderNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Expected Delivery Date</label>
            <input 
              type="date" 
              className="input" 
              value={newOrderDate}
              onChange={(e) => setNewOrderDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button 
            className="btn-secondary" 
            onClick={() => setShowAdd(false)}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleCreateOrder}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Order"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
