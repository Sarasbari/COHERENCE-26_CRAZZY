import { useFilterContext } from '../context/FilterContext';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';
import { DEPARTMENTS } from '../config/constants';

export default function Leaderboard() {
    const { leaderboard, loading } = useFilterContext();

    if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

    const medalColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
    const medalIcons = [Trophy, Medal, Medal];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Trophy className="text-gold-400" size={28} />
                    Department Leaderboard
                </h2>
                <p className="text-white/40 text-sm">Efficiency ranking based on utilization rate and anomaly frequency</p>
            </motion.div>

            {/* Podium - Top 3 */}
            <div className="grid grid-cols-3 gap-4">
                {leaderboard.slice(0, 3).map((dept, i) => {
                    const deptInfo = DEPARTMENTS.find(d => d.id === dept.department);
                    const MedalIcon = medalIcons[i] || Medal;
                    return (
                        <motion.div
                            key={dept.department}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className={`glass-card p-6 text-center ${i === 0 ? 'ring-2 ring-gold-500/30' : ''}`}
                        >
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${medalColors[i]}20` }}>
                                <MedalIcon size={28} style={{ color: medalColors[i] }} />
                            </div>
                            <p className="text-xs text-white/40 mb-1">#{i + 1}</p>
                            <h4 className="text-lg font-bold text-white mb-1">{deptInfo?.name || dept.departmentName}</h4>
                            <p className="text-3xl font-black gradient-text">{dept.score.toFixed(0)}</p>
                            <p className="text-xs text-white/40 mt-1">Efficiency Score</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-surface-800/50 rounded-lg p-2">
                                    <p className="text-white/40">Utilization</p>
                                    <p className="text-white font-semibold">{formatPercent(dept.utilization)}</p>
                                </div>
                                <div className="bg-surface-800/50 rounded-lg p-2">
                                    <p className="text-white/40">Anomalies</p>
                                    <p className="text-white font-semibold">{dept.anomalyCount}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Full Rankings Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
                <h3 className="section-title mb-4">Full Rankings</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-white/50">Rank</th>
                                <th className="text-left py-3 px-4 text-white/50">Department</th>
                                <th className="text-right py-3 px-4 text-white/50">Allocated</th>
                                <th className="text-right py-3 px-4 text-white/50">Spent</th>
                                <th className="text-right py-3 px-4 text-white/50">Utilization</th>
                                <th className="text-right py-3 px-4 text-white/50">Anomalies</th>
                                <th className="text-right py-3 px-4 text-white/50">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((dept, i) => {
                                const deptInfo = DEPARTMENTS.find(d => d.id === dept.department);
                                return (
                                    <motion.tr
                                        key={dept.department}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/2"
                                    >
                                        <td className="py-3 px-4">
                                            <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${i < 3 ? 'bg-gold-500/20 text-gold-400' : 'bg-surface-800 text-white/40'
                                                }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-white/80 flex items-center gap-2">
                                            <span>{deptInfo?.icon}</span> {deptInfo?.name || dept.departmentName}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white/60">{formatCurrency(dept.allocated)}</td>
                                        <td className="py-3 px-4 text-right text-white/60">{formatCurrency(dept.spent)}</td>
                                        <td className="py-3 px-4 text-right font-semibold" style={{ color: dept.utilization >= 70 ? '#22c55e' : dept.utilization >= 50 ? '#eab308' : '#ef4444' }}>
                                            {formatPercent(dept.utilization)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={dept.anomalyCount > 5 ? 'text-severity-high' : 'text-white/60'}>
                                                {dept.anomalyCount}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="font-bold gradient-text">{dept.score.toFixed(0)}</span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
