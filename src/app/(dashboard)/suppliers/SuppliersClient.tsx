"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, Plus, Search, RefreshCcw, Mail, Phone } from "lucide-react";
import { fetchSuppliers, deleteSupplier } from "@/lib/api/suppliers";
import { StatCard }    from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageLoader }  from "@/components/ui/Loader";
import { Modal }       from "@/components/ui/Modal";
import { useCanWrite } from "@/components/providers/AuthProvider";
import { formatDate }  from "@/lib/utils";
import type { Supplier } from "@/types";

export default function SuppliersClient() {
  const canWrite = useCanWrite();
  const [suppliers, setSuppliers]     = useState<Supplier[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [search, setSearch]           = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );
  const active   = suppliers.filter((s) => s.status === "active").length;
  const inactive = suppliers.filter((s) => s.status === "inactive").length;

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSupplier(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard title="Total Suppliers" value={suppliers.length} icon={Truck}  accent="indigo"  />
        <StatCard title="Active"          value={active}           icon={Truck}  accent="emerald" />
        <StatCard title="Inactive"        value={inactive}         icon={Truck}  accent="gray"    />
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="suppliers-search"
            type="text"
            placeholder="Search suppliers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button onClick={load} className="btn-secondary" id="suppliers-refresh">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
        {canWrite && (
          <button onClick={() => setShowAdd(true)} className="btn-primary" id="suppliers-add">
            <Plus className="h-4 w-4" /> Add Supplier
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {isLoading ? <PageLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-slate-500">No suppliers found.</p>
          )}
          {filtered.map((supplier) => (
            <div key={supplier.id} className="card p-5 space-y-3 hover:border-brand-500/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100">{supplier.name}</h3>
                  {supplier.contact_name && (
                    <p className="text-xs text-slate-500 mt-0.5">{supplier.contact_name}</p>
                  )}
                </div>
                <StatusBadge status={supplier.status} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                <span className="text-xs text-slate-500">
                  Since {formatDate(supplier.created_at)}
                </span>
                {canWrite && (
                  <div className="flex gap-2">
                    <button className="btn-ghost text-xs py-1 px-2">Edit</button>
                    <button
                      onClick={() => setDeleteTarget(supplier)}
                      className="btn-ghost text-xs py-1 px-2 text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {canWrite && (
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Supplier">
          <div className="space-y-3">
            {["Company Name", "Contact Name", "Email", "Phone", "Address", "Lead Time Days"].map((label) => (
              <div key={label}>
                <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
                <input id={`supplier-${label.toLowerCase().replace(/ /g, "-")}`} className="input" placeholder={label} />
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary">Save Supplier</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {canWrite && (
        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Supplier" size="sm">
          <p className="text-sm text-slate-300">
            Delete <span className="font-semibold text-red-400">{deleteTarget?.name}</span>? This
            cannot be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
