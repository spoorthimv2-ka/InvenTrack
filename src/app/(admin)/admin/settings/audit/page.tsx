"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs } from "@/lib/api/settings";
import { SettingsSection } from "@/components/settings/SettingsUI";
import { FileText, Database } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/types";

export const dynamic = "force-dynamic";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAuditLogs(50); // fetch last 50
    setLogs(data as AuditLog[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-400" /> System Audit Logs
        </h1>
        <p className="text-sm text-slate-400 mt-1">Review critical system events and data changes.</p>
      </div>

      <SettingsSection title="Recent Activity">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No recent audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">Time</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">Operation</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">Table</th>
                  <th className="py-2 text-left text-xs font-semibold text-slate-400">Record ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 pr-4 text-xs text-slate-500">
                      {formatDate(log.changed_at)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        log.operation === 'INSERT' ? 'bg-emerald-500/20 text-emerald-400' :
                        log.operation === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.operation}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs font-mono text-slate-300">{log.table_name}</td>
                    <td className="py-2 text-xs font-mono text-slate-500 truncate max-w-[150px]" title={log.record_id ?? ""}>
                      {log.record_id ? log.record_id.split('-')[0] + '...' : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
