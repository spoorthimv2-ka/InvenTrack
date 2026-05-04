"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package, Plus, Search, Filter, RefreshCcw, TrendingDown, TrendingUp, AlertCircle,
} from "lucide-react";
import { useInventoryStore }    from "@/store/inventory.store";
import { fetchProducts, deleteProduct, createProduct } from "@/lib/api/inventory";
import { StatCard }             from "@/components/ui/StatCard";
import { StatusBadge }          from "@/components/ui/StatusBadge";
import { PageLoader }           from "@/components/ui/Loader";
import { Modal }                from "@/components/ui/Modal";
import { useCanWrite }          from "@/components/providers/AuthProvider";
import { formatCurrency, formatDate } from "@/lib/utils";

import type { Product } from "@/types";

export default function InventoryClient() {
  const {
    products, isLoading, search, categoryFilter, activeFilter, pagination,
    setProducts, setLoading, setSearch, setActiveFilter, setPagination,
    setSelectedProduct,
  } = useInventoryStore();

  const canWrite = useCanWrite(); // true only for admin
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    unit_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    reorder_level: 10,
    is_active: true
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isActive =
        activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;
      const { products: data, total } = await fetchProducts({
        search,
        categoryId: categoryFilter,
        isActive,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setProducts(data);
      setPagination({ total });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, activeFilter, pagination.page, pagination.pageSize,
      setProducts, setLoading, setPagination]);

  useEffect(() => { load(); }, [load]);

  const inStock  = products.filter((p) => p.status === "in_stock").length;
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const outStock = products.filter((p) => p.status === "out_of_stock").length;

  async function handleSaveProduct() {
    if (!newProduct.name || !newProduct.sku) {
      alert("Name and SKU are required.");
      return;
    }
    setIsSaving(true);
    try {
      await createProduct(newProduct as unknown as Product);
      setShowAddModal(false);

      setNewProduct({
        name: "",
        sku: "",
        unit_price: 0,
        cost_price: 0,
        stock_quantity: 0,
        reorder_level: 10,
        is_active: true
      });
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Total Products" value={pagination.total} icon={Package}      accent="indigo"  />
        <StatCard title="In Stock"        value={inStock}          icon={TrendingUp}   accent="emerald" />
        <StatCard title="Low Stock"       value={lowStock}         icon={TrendingDown} accent="amber"   />
        <StatCard title="Out of Stock"    value={outStock}         icon={AlertCircle}  accent="red"     />
      </div>

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="inventory-search"
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              id="inventory-active-filter"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
              className="input w-36"
            >
              <option value="all">All Items</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button onClick={load} className="btn-secondary" id="inventory-refresh">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>

          {/* Admin-only: Add Product */}
          {canWrite && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary" id="inventory-add">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? <PageLoader /> : (
          <table className="table">
            <thead>
              <tr>
                <th>Product / SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder At</th>
                <th>Unit Price</th>
                <th>Cost Price</th>
                <th>Status</th>
                <th>Updated</th>
                {canWrite && <th></th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 9 : 8} className="py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div>
                      <p className="font-medium text-slate-200">{product.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                    </div>
                  </td>
                  <td>{product.category?.name ?? "—"}</td>
                  <td>
                    <span
                      className={
                        product.stock_quantity === 0
                          ? "font-semibold text-red-400"
                          : product.stock_quantity <= product.reorder_level
                          ? "font-semibold text-amber-400"
                          : ""
                      }
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="text-slate-400">{product.reorder_level}</td>
                  <td>{formatCurrency(product.unit_price)}</td>
                  <td className="text-slate-400">{formatCurrency(product.cost_price)}</td>
                  <td>
                    <StatusBadge
                      status={product.status ?? "in_stock"}
                      label={product.is_active ? undefined : "Inactive"}
                    />
                  </td>
                  <td className="text-slate-500">{formatDate(product.updated_at)}</td>
                  {canWrite && (
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="btn-ghost text-xs py-1 px-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {(pagination.page - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary py-1"
              disabled={pagination.page <= 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
            >
              Previous
            </button>
            <button
              className="btn-secondary py-1"
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => setPagination({ page: pagination.page + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Modal — admin only */}
      {canWrite && (
        <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Product">
          <div className="space-y-3">
            {[
              { id: "name",       label: "Product Name",  type: "text" },
              { id: "sku",        label: "SKU",           type: "text" },
              { id: "unit_price", label: "Unit Price",    type: "number" },
              { id: "cost_price", label: "Cost Price",    type: "number" },
              { id: "stock_quantity", label: "Stock Qty", type: "number" },
              { id: "reorder_level",  label: "Reorder Level", type: "number" },
            ].map(({ id, label, type }) => (
              <div key={id}>
                <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-400">
                  {label}
                </label>
                <input 
                  id={id} 
                  type={type} 
                  className="input" 
                  placeholder={label}
                  value={newProduct[id as keyof typeof newProduct] as string | number}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    [id]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
                  })}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button 
              className="btn-secondary" 
              onClick={() => setShowAddModal(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSaveProduct}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm — admin only */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <p className="text-sm text-slate-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-400">{deleteTarget?.name}</span>?
          This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
