"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart as BarChartIcon, TrendingUp, DollarSign, Package } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

// ── Mock data (replace with Supabase aggregation queries) ──────────────────
const monthlyStock = [
  { month: "Nov", value: 4200 },
  { month: "Dec", value: 3800 },
  { month: "Jan", value: 5100 },
  { month: "Feb", value: 4700 },
  { month: "Mar", value: 5600 },
  { month: "Apr", value: 6200 },
];

const categoryBreakdown = [
  { name: "Electronics",  value: 34 },
  { name: "Apparel",      value: 21 },
  { name: "Food & Bev",   value: 18 },
  { name: "Tools",        value: 15 },
  { name: "Other",        value: 12 },
];

const orderTrend = [
  { month: "Nov", pending: 12, delivered: 30 },
  { month: "Dec", pending: 18, delivered: 42 },
  { month: "Jan", pending: 9,  delivered: 37 },
  { month: "Feb", pending: 14, delivered: 50 },
  { month: "Mar", pending: 22, delivered: 58 },
  { month: "Apr", pending: 16, delivered: 63 },
];

const PIE_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#64748b"];

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: "12px",
};

export default function ReportsClient() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Inventory Value"  value="$248,320"  icon={DollarSign}  accent="indigo"  trend={{ value: 8.2, label: "vs last month" }} />
        <StatCard title="Items Tracked"    value="1,843"     icon={Package}     accent="blue"    trend={{ value: 3.1, label: "vs last month" }} />
        <StatCard title="Orders This Month" value="79"       icon={BarChartIcon}   accent="emerald" trend={{ value: 12.4, label: "vs last month" }} />
        <StatCard title="Avg Order Value"   value="$3,142"   icon={TrendingUp}  accent="amber"   trend={{ value: -2.1, label: "vs last month" }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stock Trend */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">
            Stock Levels — Last 6 Months
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyStock}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">
            Category Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-300">
          Orders Overview — Pending vs Delivered
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={orderTrend} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="delivered" name="Delivered" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
