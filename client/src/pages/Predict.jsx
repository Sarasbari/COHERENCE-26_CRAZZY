import { useMemo, useState } from 'react';
import { useFilterContext } from '../context/FilterContext';
import { getReallocationAdvice } from '../services/groqService';
import { aggregateByDepartment } from '../data/generator';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';
import { DEPARTMENTS } from '../config/constants';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Brain, Loader2, Sliders } from 'lucide-react';

export default function Predict() {
    const { filteredData, analysis, loading } = useFilterContext();
    const [reallocationAdvice, setReallocationAdvice] = useState('');
    const [adviceLoading, setAdviceLoading] = useState(false);

    const deptUtilization = useMemo(() => {
        const agg = aggregateByDepartment(filteredData);
        return Object.values(agg).map(d => ({
            ...d,
            deptInfo: DEPARTMENTS.find(dep => dep.id === d.department),
        })).sort((a, b) => a.utilization - b.utilization);
    }, [filteredData]);

    const lapsePredictions = useMemo(() => {
        if (!analysis?.lapsePredictions) return [];
        return Object.values(analysis.lapsePredictions).slice(0, 10);
    }, [analysis]);

    const handleGetAdvice = async () => {
        setAdviceLoading(true);
        const result = await getReallocationAdvice(deptUtilization, { budgetSummary: analysis?.summary });
        setReallocationAdvice(result.message);
        setAdviceLoading(false);
    };

    if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-white mb-1">Predictions & Optimization</h2>
                <p className="text-white/40 text-sm">Fund lapse forecasting and reallocation recommendations</p>
            </motion.div>

            {/* Fund Lapse Risk Gauges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <h3 className="section-title mb-1">Fund Lapse Risk Assessment</h3>
                <p className="section-subtitle mb-6">Departments at risk of underutilizing allocated funds</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {deptUtilization.map((dept, i) => {
                        const risk = dept.utilization < 40 ? 'critical' : dept.utilization < 60 ? 'high' : dept.utilization < 80 ? 'medium' : 'low';
                        const riskColors = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
                        return (
                            <motion.div
                                key={dept.department}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-4 text-center"
                            >
                                {/* Circular gauge */}
                                <div className="relative w-24 h-24 mx-auto mb-3">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                        <motion.circle
                                            cx="50" cy="50" r="40" fill="none"
                                            stroke={riskColors[risk]}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${dept.utilization * 2.51} 251`}
                                            initial={{ strokeDasharray: '0 251' }}
                                            animate={{ strokeDasharray: `${dept.utilization * 2.51} 251` }}
                                            transition={{ delay: i * 0.1, duration: 1 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">{dept.utilization.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-white/60 font-medium truncate">{dept.departmentName}</p>
                                <span className={`mt-1 inline-block badge-${risk}`}>{risk}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Lapse Predictions Table */}
            {lapsePredictions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                    <h3 className="section-title mb-1 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-severity-high" />
                        Fund Lapse Predictions
                    </h3>
                    <p className="section-subtitle mb-4">Departments projected to underutilize funds at current spending rate</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-white/50">Department</th>
                                    <th className="text-left py-3 px-4 text-white/50">Division</th>
                                    <th className="text-left py-3 px-4 text-white/50">FY</th>
                                    <th className="text-right py-3 px-4 text-white/50">Projected Util.</th>
                                    <th className="text-right py-3 px-4 text-white/50">Lapse Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lapsePredictions.map((pred, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white/80">{pred.departmentName}</td>
                                        <td className="py-3 px-4 text-white/60">{pred.divisionName}</td>
                                        <td className="py-3 px-4 text-white/60">FY {pred.fiscalYear}</td>
                                        <td className="py-3 px-4 text-right text-severity-high font-medium">{pred.projectedUtilization.toFixed(1)}%</td>
                                        <td className="py-3 px-4 text-right text-severity-critical font-medium">{formatCurrency(pred.lapseAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* AI Reallocation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="section-title flex items-center gap-2">
                            <Sliders size={18} className="text-gold-400" />
                            Reallocation Simulator
                        </h3>
                        <p className="section-subtitle">AI-powered fund reallocation recommendations</p>
                    </div>
                    <button onClick={handleGetAdvice} disabled={adviceLoading} className="btn-primary flex items-center gap-2">
                        {adviceLoading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                        Get AI Recommendation
                    </button>
                </div>
                {reallocationAdvice && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-gold-500/5 border border-gold-500/10 rounded-xl">
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{reallocationAdvice}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
