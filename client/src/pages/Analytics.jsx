import { useMemo } from 'react';
import { useFilterContext } from '../context/FilterContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Cell } from 'recharts';
import { aggregateByDepartment, aggregateByDivision, aggregateByYear } from '../data/generator';
import { formatCurrency } from '../utils/formatCurrency';
import { DEPARTMENTS } from '../config/constants';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-elevated">
            <p className="text-sm font-medium text-[#0F172A] mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-xs" style={{ color: p.color }}>
                    {p.name}: {formatCurrency(p.value)}
                </p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const { filteredData, loading } = useFilterContext();

    const deptData = useMemo(() => {
        const agg = aggregateByDepartment(filteredData);
        return Object.values(agg).map(d => ({
            name: d.departmentName.length > 15 ? d.departmentName.substring(0, 15) + '...' : d.departmentName,
            allocated: d.allocated,
            spent: d.spent,
            utilization: d.utilization,
            color: DEPARTMENTS.find(dep => dep.id === d.department)?.color || '#64748b',
        }));
    }, [filteredData]);

    const yearData = useMemo(() => {
        const agg = aggregateByYear(filteredData);
        return Object.values(agg);
    }, [filteredData]);

    const divData = useMemo(() => {
        const agg = aggregateByDivision(filteredData);
        return Object.values(agg).map(d => ({
            name: d.divisionName,
            allocated: d.allocated,
            spent: d.spent,
            utilization: d.utilization,
        }));
    }, [filteredData]);

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Budget Analytics</h2>
                <p className="text-[#64748B] text-sm">Deep-dive into department and division spending patterns</p>
            </motion.div>

            {/* Department Comparison */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <h3 className="section-title mb-1">Department-wise Allocation vs Spending</h3>
                <p className="section-subtitle mb-4">Compare budget performance across 8 departments</p>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={deptData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#64748B', fontSize: 12 }} />
                        <Bar dataKey="allocated" name="Allocated" fill="#1E3A8A" radius={[4, 4, 0, 0]} opacity={0.7} />
                        <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
                            {deptData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Yearly Trends */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                    <h3 className="section-title mb-1">Yearly Spending Trend</h3>
                    <p className="section-subtitle mb-4">5-year allocation vs spending trajectory</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={yearData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="fiscalYear" tick={{ fill: '#64748B', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#64748B', fontSize: 12 }} />
                            <Line type="monotone" dataKey="allocated" name="Allocated" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#1E3A8A', r: 4 }} />
                            <Line type="monotone" dataKey="spent" name="Spent" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Division Comparison */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                    <h3 className="section-title mb-1">Division Comparison</h3>
                    <p className="section-subtitle mb-4">Allocation and utilization by division</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={divData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#64748B', fontSize: 11 }} width={110} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="allocated" name="Allocated" fill="#1E3A8A" radius={[0, 4, 4, 0]} opacity={0.7} />
                            <Bar dataKey="spent" name="Spent" fill="#60A5FA" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Utilization Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                <h3 className="section-title mb-4">Department Utilization Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E2E8F0]">
                                <th className="text-left py-3 px-4 text-[#64748B] font-medium">Department</th>
                                <th className="text-right py-3 px-4 text-[#64748B] font-medium">Allocated</th>
                                <th className="text-right py-3 px-4 text-[#64748B] font-medium">Released</th>
                                <th className="text-right py-3 px-4 text-[#64748B] font-medium">Spent</th>
                                <th className="text-right py-3 px-4 text-[#64748B] font-medium">Utilization</th>
                                <th className="text-right py-3 px-4 text-[#64748B] font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deptData.map((dept, i) => (
                                <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                                    <td className="py-3 px-4 text-[#0F172A] font-medium">{dept.name}</td>
                                    <td className="py-3 px-4 text-right text-[#64748B]">{formatCurrency(dept.allocated)}</td>
                                    <td className="py-3 px-4 text-right text-[#64748B]">—</td>
                                    <td className="py-3 px-4 text-right text-[#64748B]">{formatCurrency(dept.spent)}</td>
                                    <td className="py-3 px-4 text-right font-semibold" style={{ color: dept.utilization >= 70 ? '#16A34A' : dept.utilization >= 50 ? '#F59E0B' : '#DC2626' }}>
                                        {dept.utilization.toFixed(1)}%
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className={dept.utilization >= 70 ? 'badge-low' : dept.utilization >= 50 ? 'badge-medium' : 'badge-critical'}>
                                            {dept.utilization >= 70 ? 'Healthy' : dept.utilization >= 50 ? 'Warning' : 'Critical'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
