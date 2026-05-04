"use client";

import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient }        from "@/lib/supabase/client";
import { useInventoryStore }   from "@/store/inventory.store";
import { useOrdersStore }      from "@/store/orders.store";
import type { Product, Order } from "@/types";

type ConnectionStatus = "connecting" | "live" | "error" | "offline";

/**
 * Mounts a Supabase Realtime subscription for the full dashboard session.
 * Renders a small live/offline pill in the header.
 * Patches Zustand stores in-place — no full refetch.
 */
export function RealtimeIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("inventrack-realtime", {
        config: { broadcast: { self: false } },
      })

      // ── Products ────────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          const updated = payload.new as Product;
          const old = payload.old as Partial<Product>;
          // Fast-path: only stock changed
          if (updated.stock_quantity !== old.stock_quantity) {
            useInventoryStore.getState().updateStock(updated.id, updated.stock_quantity);
          } else {
            useInventoryStore.getState().patchProduct(updated.id, updated);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          useInventoryStore.getState().insertProduct(payload.new as Product);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products" },
        (payload) => {
          useInventoryStore.getState().removeProduct((payload.old as { id: string }).id);
        }
      )

      // ── Orders ──────────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          useOrdersStore.getState().patchOrder(
            (payload.new as Order).id,
            payload.new as Partial<Order>
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          useOrdersStore.getState().insertOrder(payload.new as Order);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders" },
        (payload) => {
          useOrdersStore.getState().removeOrder((payload.old as { id: string }).id);
        }
      )

      .subscribe((s, err) => {
        if (s === "SUBSCRIBED")    setStatus("live");
        if (s === "CHANNEL_ERROR") { setStatus("error"); console.error("[Realtime]", err); }
        if (s === "TIMED_OUT")     setStatus("offline");
        if (s === "CLOSED")        setStatus("offline");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  const pill: Record<ConnectionStatus, { label: string; cls: string; Icon: React.ElementType }> = {
    connecting: { label: "Connecting…", cls: "text-slate-400 bg-slate-700/60",              Icon: Wifi    },
    live:       { label: "Live",        cls: "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30", Icon: Wifi    },
    error:      { label: "RT Error",    cls: "text-red-400 bg-red-500/10 ring-1 ring-red-500/30",             Icon: WifiOff },
    offline:    { label: "Offline",     cls: "text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/25",       Icon: WifiOff },
  };

  const { label, cls, Icon } = pill[status];

  return (
    <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      {status === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {status !== "live" && <Icon className="h-3 w-3" />}
      {label}
    </div>
  );
}
