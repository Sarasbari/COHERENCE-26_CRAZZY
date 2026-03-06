import { useFilterContext } from '../context/FilterContext';
import { aggregateByDivision, aggregateByDepartment } from '../data/generator';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';
import { DIVISIONS } from '../config/constants';
import { motion } from 'framer-motion';
import { FileText, Download, Brain } from 'lucide-react';
import { useMemo } from 'react';

export default function Reports() {
    const { filteredData, analysis, filters, loading } = useFilterContext();

    const divisionReports = useMemo(() => {
        const agg = aggregateByDivision(filteredData);
        return Object.entries(agg).map(([divId, data]) => {
            const deptAgg = aggregateByDepartment(data.records);
            return {
                divisionId: divId,
                ...data,
                departments: Object.values(deptAgg),
                anomalyCount: data.records.filter(r => r.hasAnomaly).length,
            };
        });
    }, [filteredData]);

    if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <FileText className="text-gold-400" size={28} />
                    Budget Reports
                </h2>
                <p className="text-white/40 text-sm">Division-level budget health summaries — FY {filters.fiscalYear || 'All Years'}</p>
            </motion.div>

            {divisionReports.map((report, i) => (
                <motion.div
                    key={report.divisionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="glass-card overflow-hidden"
                >
                    {/* Division header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between"
                        style={{ background: `linear-gradient(135deg, ${DIVISIONS[report.divisionId]?.color}10, transparent)` }}>
                        <div>
                            <h3 className="text-lg font-bold text-white">{report.divisionName}</h3>
                            <p className="text-xs text-white/40">{DIVISIONS[report.divisionId]?.districts.length} districts • {report.departments.length} departments</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="text-right">
                                <p className="text-white/40 text-xs">Total Allocated</p>
                                <p className="font-bold text-white">{formatCurrency(report.allocated)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/40 text-xs">Total Spent</p>
                                <p className="font-bold text-white">{formatCurrency(report.spent)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/40 text-xs">Utilization</p>
                                <p className="font-bold" style={{ color: report.utilization >= 70 ? '#22c55e' : report.utilization >= 50 ? '#eab308' : '#ef4444' }}>
                                    {formatPercent(report.utilization)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/40 text-xs">Anomalies</p>
                                <p className="font-bold text-severity-high">{report.anomalyCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Department breakdown */}
                    <div className="px-6 py-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-2 px-2 text-white/40 text-xs font-medium">Department</th>
                                    <th className="text-right py-2 px-2 text-white/40 text-xs font-medium">Allocated</th>
                                    <th className="text-right py-2 px-2 text-white/40 text-xs font-medium">Spent</th>
                                    <th className="text-right py-2 px-2 text-white/40 text-xs font-medium">Utilization</th>
                                    <th className="text-right py-2 px-2 text-white/40 text-xs font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.departments.map((dept) => (
                                    <tr key={dept.department} className="border-b border-white/3">
                                        <td className="py-2 px-2 text-white/70">{dept.departmentName}</td>
                                        <td className="py-2 px-2 text-right text-white/50">{formatCurrency(dept.allocated)}</td>
                                        <td className="py-2 px-2 text-right text-white/50">{formatCurrency(dept.spent)}</td>
                                        <td className="py-2 px-2 text-right font-medium" style={{ color: dept.utilization >= 70 ? '#22c55e' : dept.utilization >= 50 ? '#eab308' : '#ef4444' }}>
                                            {formatPercent(dept.utilization)}
                                        </td>
                                        <td className="py-2 px-2 text-right">
                                            <span className={dept.utilization >= 70 ? 'badge-low' : dept.utilization >= 50 ? 'badge-medium' : 'badge-critical'}>
                                                {dept.utilization >= 70 ? 'On Track' : dept.utilization >= 50 ? 'Warning' : 'Critical'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
