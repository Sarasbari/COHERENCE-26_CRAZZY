import { motion } from 'framer-motion';
import { Wallet, Monitor, AlertTriangle, ShieldAlert, MoreVertical, Search, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────

const areaData = [
    { name: 'Q1', allocated: 28000, released: 18000 },
    { name: 'Q2', allocated: 52000, released: 35000 },
    { name: 'Q3', allocated: 78000, released: 50000 },
    { name: 'Q4', allocated: 95000, released: 65000 },
];

const donutData = [
    { name: 'Public Works', value: 40, color: '#DC2626' },
    { name: 'Healthcare', value: 28, color: '#F59E0B' },
    { name: 'Education', value: 20, color: '#3B82F6' },
    { name: 'Other', value: 12, color: '#60A5FA' },
];

const districtData = [
    { district: 'Pune', allocated: '₹45,200', utilization: 78, flagged: '₹120', flagColor: '#64748B', risk: 'Low', riskColor: '#16A34A' },
    { district: 'Nagpur', allocated: '₹32,150', utilization: 42, flagged: '₹840', flagColor: '#DC2626', risk: 'High', riskColor: '#DC2626' },
    { district: 'Mumbai City', allocated: '₹85,000', utilization: 65, flagged: '₹320', flagColor: '#64748B', risk: 'Medium', riskColor: '#F59E0B' },
    { district: 'Aurangabad', allocated: '₹39,400', utilization: 39, flagged: '₹39', flagColor: '#64748B', risk: 'High', riskColor: '#DC2626' },
];

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
                    {p.name}: ₹{(p.value / 1000).toFixed(0)}k Cr
                </p>
            ))}
        </div>
    );
}

// ─── Dashboard Page ──────────────────────────────────────────

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-4 gap-4">
                <KPICard
                    label="Total Budget"
                    value="₹4.5 Lakh Cr"
                    sub="+5.2% from last year"
                    subColor="#16A34A"
                    icon={Wallet}
                    iconColor="#1E3A8A"
                    delay={0}
                />
                <KPICard
                    label="Funds Released"
                    value="₹2.1 Lakh Cr"
                    sub="+3.1% utilization"
                    subColor="#16A34A"
                    icon={Monitor}
                    iconColor="#3B82F6"
                    delay={1}
                    progress={46}
                    progressColor="#3B82F6"
                />
                <KPICard
                    label="Detected Leakages"
                    value="₹1,200 Cr"
                    sub="+1.5% increase"
                    subColor="#F59E0B"
                    icon={AlertTriangle}
                    iconColor="#F59E0B"
                    delay={2}
                />
                <KPICard
                    label="Risk Score"
                    value="High Risk"
                    sub="Requires attention in 4 districts"
                    subColor="#64748B"
                    icon={ShieldAlert}
                    iconColor="#DC2626"
                    delay={3}
                />
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-5 gap-4">
                {/* Area Chart — 3 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-3 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-card"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-[#0F172A]">Allocated vs Released Funds</h3>
                            <p className="text-xs text-[#64748B] mt-1">Cumulative comparison over FY 2023-24</p>
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
                                tickFormatter={(v) => v === 0 ? '0' : `${v / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="allocated" stroke="#1E3A8A" strokeWidth={2}
                                fill="url(#gradAllocated)" name="Allocated" />
                            <Area type="monotone" dataKey="released" stroke="#60A5FA" strokeWidth={2}
                                fill="url(#gradReleased)" name="Released" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Donut Chart — 2 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-card"
                >
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-base font-semibold text-[#0F172A]">Leakage by Dept</h3>
                        <button className="p-1 rounded hover:bg-[#F1F5F9]">
                            <MoreVertical size={16} className="text-[#94A3B8]" />
                        </button>
                    </div>
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
                                <span className="text-lg font-bold text-[#0F172A]">1.2K Cr</span>
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
                                    <span className="text-[#0F172A] font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Row 3: District Performance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-card"
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-[#0F172A]">District Performance</h3>
                        <p className="text-xs text-[#64748B] mt-1">Detailed utilization and risk analysis by district.</p>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search districts..."
                            className="pl-8 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#3B82F6] w-56"
                        />
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#E2E8F0]">
                            <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">District</th>
                            <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Allocated (Cr)</th>
                            <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Utilization</th>
                            <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Flagged Amt.</th>
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
                                    <td className="py-3.5 px-2 text-sm text-[#0F172A]">{row.allocated}</td>
                                    <td className="py-3.5 px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${row.utilization}%`, backgroundColor: barColor }}
                                                />
                                            </div>
                                            <span className="text-sm text-[#0F172A]">{row.utilization}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-2 text-sm" style={{ color: row.flagColor }}>{row.flagged}</td>
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
            </motion.div>
        </div>
    );
}
