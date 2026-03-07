import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Monitor, AlertTriangle, ShieldAlert, MoreVertical, Search, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFilterContext } from '../context/FilterContext';
import { aggregateByDepartment, aggregateByDivision } from '../data/generator';
import { DEPARTMENTS, DIVISIONS } from '../config/constants';

// ─── Format helpers ──────────────────────────────────────────

function formatCrores(value) {
    if (!value) return '₹0';
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
}

// ─── KPI Card Component ──────────────────────────────────────

function KPICard({ label, value, sub, subColor, icon: Icon, iconColor, progress, progressColor, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 relative shadow-card"
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-[#64748B]">{label}</p>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center`}
                    style={{ backgroundColor: `${iconColor}15` }}>
                    <Icon size={18} style={{ color: iconColor }} />
                </div>
            </div>
            <p className="text-2xl font-bold text-[#0F172A] mb-1" style={subColor === '#F59E0B' ? { color: '#F59E0B' } : {}}>
                {value}
            </p>
            <p className="text-xs flex items-center gap-1" style={{ color: subColor }}>
                <TrendingUp size={12} />
                {sub}
            </p>
            {progress !== undefined && (
                <div className="mt-3 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: progressColor }}
                    />
                </div>
            )}
        </motion.div>
    );
}

// ─── Custom Tooltip ──────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload) return null;
    return (
        <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs shadow-elevated">
            <p className="text-[#0F172A] font-medium mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {formatCrores(p.value)}
                </p>
            ))}
        </div>
    );
}

// ─── Dashboard Page ──────────────────────────────────────────

export default function Dashboard() {
    const { filteredData, allData, analysis, loading, error, dataSource, filters } = useFilterContext();

    // Derive area chart data (by fiscal year or quarter)
    const areaData = useMemo(() => {
        if (!filteredData.length) return [];
        const yearMap = {};
        filteredData.forEach((r) => {
            const key = r.fiscalYear || 'Unknown';
            if (!yearMap[key]) yearMap[key] = { name: key, allocated: 0, released: 0, spent: 0 };
            yearMap[key].allocated += r.allocated || 0;
            yearMap[key].released += r.released || 0;
            yearMap[key].spent += r.spent || 0;
        });
        return Object.values(yearMap).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData]);

    // Derive donut chart data (by department)
    const donutData = useMemo(() => {
        if (!filteredData.length) return [];
        const deptAgg = aggregateByDepartment(filteredData);
        const colors = ['#DC2626', '#F59E0B', '#3B82F6', '#60A5FA', '#16A34A', '#8B5CF6', '#14B8A6', '#1E3A8A'];
        return Object.values(deptAgg).map((dept, i) => ({
            name: dept.departmentName,
            value: dept.allocated || dept.spent || 1,
            color: DEPARTMENTS.find(d => d.id === dept.department)?.color || colors[i % colors.length],
        }));
    }, [filteredData]);

    // Derive district table data
    const districtData = useMemo(() => {
        if (!filteredData.length) return [];
        const districtMap = {};
        filteredData.forEach((r) => {
            if (!r.district) return;
            if (!districtMap[r.district]) {
                districtMap[r.district] = {
                    district: r.district,
                    allocated: 0,
                    released: 0,
                    spent: 0,
                    anomalyCount: 0,
                    leakageTotal: 0,
                    count: 0,
                };
            }
            districtMap[r.district].allocated += r.allocated || 0;
            districtMap[r.district].released += r.released || 0;
            districtMap[r.district].spent += r.spent || 0;
            districtMap[r.district].leakageTotal += r.leakageScore || 0;
            districtMap[r.district].count += 1;
            if (r.hasAnomaly) districtMap[r.district].anomalyCount += 1;
        });

        return Object.values(districtMap)
            .map((d) => ({
                ...d,
                utilization: d.allocated > 0 ? ((d.spent / d.allocated) * 100) : 0,
                avgLeakage: d.count > 0 ? (d.leakageTotal / d.count) : 0,
                risk: d.anomalyCount > 3 ? 'High' : d.anomalyCount > 1 ? 'Medium' : 'Low',
                riskColor: d.anomalyCount > 3 ? '#DC2626' : d.anomalyCount > 1 ? '#F59E0B' : '#16A34A',
            }))
            .sort((a, b) => b.allocated - a.allocated)
            .slice(0, 10);
    }, [filteredData]);

    // KPI totals
    const kpis = useMemo(() => {
        if (!analysis?.summary) return null;
        return analysis.summary;
    }, [analysis]);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-10 h-10 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#64748B]">Loading data from Firebase...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <WifiOff size={48} className="text-[#DC2626]" />
                <p className="text-lg font-semibold text-[#0F172A]">Firebase Connection Error</p>
                <p className="text-sm text-[#64748B] max-w-md text-center">{error}</p>
            </div>
        );
    }

    const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

    return (
        <div className="space-y-6">
            {/* Data Source Badge */}
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
                    <Wifi size={12} />
                    Live from Firebase
                </span>
                <span className="text-xs text-[#94A3B8]">
                    {allData.length} records • FY {filters.fiscalYear || 'All'}
                </span>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <KPICard
                    label="Total Budget"
                    value={kpis ? formatCrores(kpis.totalAllocated) : '—'}
                    sub={`${allData.length} records tracked`}
                    subColor="#16A34A"
                    icon={Wallet}
                    iconColor="#1E3A8A"
                    delay={0}
                />
                <KPICard
                    label="Funds Released"
                    value={kpis ? formatCrores(kpis.totalReleased) : '—'}
                    sub={kpis ? `${((kpis.totalReleased / (kpis.totalAllocated || 1)) * 100).toFixed(1)}% of allocated` : '—'}
                    subColor="#16A34A"
                    icon={Monitor}
                    iconColor="#3B82F6"
                    delay={1}
                    progress={kpis ? Math.min(100, (kpis.totalReleased / (kpis.totalAllocated || 1)) * 100) : 0}
                    progressColor="#3B82F6"
                />
                <KPICard
                    label="Detected Anomalies"
                    value={analysis ? `${analysis.anomalyCount}` : '—'}
                    sub={analysis ? `${analysis.criticalCount} critical` : '—'}
                    subColor="#F59E0B"
                    icon={AlertTriangle}
                    iconColor="#F59E0B"
                    delay={2}
                />
                <KPICard
                    label="Overall Utilization"
                    value={kpis ? `${kpis.overallUtilization.toFixed(1)}%` : '—'}
                    sub={kpis?.overallUtilization >= 70 ? 'On Track' : kpis?.overallUtilization >= 50 ? 'Needs Attention' : 'Critical'}
                    subColor={kpis?.overallUtilization >= 70 ? '#16A34A' : kpis?.overallUtilization >= 50 ? '#F59E0B' : '#DC2626'}
                    icon={ShieldAlert}
                    iconColor={kpis?.overallUtilization >= 70 ? '#16A34A' : '#DC2626'}
                    delay={3}
                />
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Area Chart — 3 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-1 lg:col-span-3 bg-white border border-[#E2E8F0] rounded-xl p-3 md:p-5 shadow-card"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-[#0F172A]">Allocated vs Released Funds</h3>
                            <p className="text-xs text-[#64748B] mt-1">Comparison across fiscal years</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />
                                    <span className="text-[#64748B]">Allocated</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                                    <span className="text-[#64748B]">Released</span>
                                </span>
                            </div>
                            <button className="p-1 rounded hover:bg-[#F1F5F9]">
                                <MoreVertical size={16} className="text-[#94A3B8]" />
                            </button>
                        </div>
                    </div>
                    {areaData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="gradAllocated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradReleased" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="allocated" stroke="#1E3A8A" strokeWidth={2}
                                    fill="url(#gradAllocated)" name="Allocated" />
                                <Area type="monotone" dataKey="released" stroke="#60A5FA" strokeWidth={2}
                                    fill="url(#gradReleased)" name="Released" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-[#94A3B8] text-sm">
                            No chart data available for current filters
                        </div>
                    )}
                </motion.div>

                {/* Donut Chart — 2 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-1 lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-3 md:p-5 shadow-card"
                >
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-base font-semibold text-[#0F172A]">Allocation by Dept</h3>
                        <button className="p-1 rounded hover:bg-[#F1F5F9]">
                            <MoreVertical size={16} className="text-[#94A3B8]" />
                        </button>
                    </div>
                    {donutData.length > 0 ? (
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <ResponsiveContainer width={200} height={200}>
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%" cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            dataKey="value"
                                            stroke="none"
                                            paddingAngle={2}
                                        >
                                            {donutData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs text-[#64748B]">Total</span>
                                    <span className="text-lg font-bold text-[#0F172A]">{formatCrores(donutTotal)}</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="w-full mt-4 space-y-2.5">
                                {donutData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[#64748B]">{item.name}</span>
                                        </span>
                                        <span className="text-[#0F172A] font-medium">
                                            {donutTotal > 0 ? ((item.value / donutTotal) * 100).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-[#94A3B8] text-sm">
                            No department data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Row 3: District Performance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-[#E2E8F0] rounded-xl p-3 md:p-5 shadow-card"
            >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6">
                    <div>
                        <h3 className="text-sm md:text-base font-semibold text-[#0F172A]">District Performance</h3>
                        <p className="text-xs text-[#64748B] mt-1">Utilization and risk analysis by district — live from Firestore</p>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search districts..."
                            className="pl-8 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#3B82F6] w-full sm:w-56"
                        />
                    </div>
                </div>

                {districtData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[#E2E8F0]">
                                    <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">District</th>
                                    <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Allocated</th>
                                    <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Utilization</th>
                                    <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Avg Leakage</th>
                                    <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {districtData.map((row, i) => {
                                    const barColor = row.utilization >= 70
                                        ? '#16A34A'
                                        : row.utilization >= 55
                                            ? '#F59E0B'
                                            : '#DC2626';
                                    return (
                                        <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                                            <td className="py-3.5 px-2 text-sm text-[#0F172A] font-medium">{row.district}</td>
                                            <td className="py-3.5 px-2 text-sm text-[#0F172A]">{formatCrores(row.allocated)}</td>
                                            <td className="py-3.5 px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{ width: `${Math.min(100, row.utilization)}%`, backgroundColor: barColor }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-[#0F172A]">{row.utilization.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-2 text-sm" style={{ color: row.avgLeakage > 15 ? '#DC2626' : '#64748B' }}>
                                                {row.avgLeakage.toFixed(1)}
                                            </td>
                                            <td className="py-3.5 px-2">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${row.riskColor}15`,
                                                        color: row.riskColor,
                                                        border: `1px solid ${row.riskColor}25`,
                                                    }}
                                                >
                                                    {row.risk}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32 text-[#94A3B8] text-sm">
                        No district data available for current filters
                    </div>
                )}
            </motion.div>
        </div>
    );
}
