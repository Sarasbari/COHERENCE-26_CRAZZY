import { useFilterContext } from '../context/FilterContext';
import SankeyDiagram from '../components/charts/SankeyDiagram';
import KPICard from '../components/cards/KPICard';
import AnomalyCard from '../components/cards/AnomalyCard';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';
import { DollarSign, ArrowUpDown, AlertTriangle, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { filteredData, analysis, loading } = useFilterContext();

    if (loading || !analysis) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { summary, anomalies, criticalCount, highCount, crsScores } = analysis;

    // Get top 5 anomalies for the alert feed
    const topAnomalies = anomalies
        .sort((a, b) => {
            const order = { critical: 4, high: 3, medium: 2, low: 1 };
            return order[b.severity] - order[a.severity];
        })
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Allocated"
                    value={formatCurrency(summary.totalAllocated)}
                    icon={DollarSign}
                    color="gold"
                    delay={0}
                />
                <KPICard
                    title="Total Spent"
                    value={formatCurrency(summary.totalSpent)}
                    icon={ArrowUpDown}
                    color="blue"
                    delay={1}
                />
                <KPICard
                    title="Utilization Rate"
                    value={formatPercent(summary.overallUtilization)}
                    icon={PieChart}
                    color={summary.overallUtilization >= 70 ? 'green' : 'red'}
                    delay={2}
                />
                <KPICard
                    title="Anomalies Detected"
                    value={anomalies.length}
                    suffix={criticalCount > 0 ? ` (${criticalCount} critical)` : ''}
                    icon={AlertTriangle}
                    color="red"
                    delay={3}
                />
            </div>

            {/* CRS Scores Row */}
            <div className="grid grid-cols-3 gap-4">
                {Object.entries(crsScores).map(([div, crs], i) => (
                    <motion.div
                        key={div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="glass-card p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-white/50">{div.charAt(0).toUpperCase() + div.slice(1)} Division</p>
                            <span className={`badge-${crs.severity}`}>{crs.severity}</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-2xl font-bold text-white">{crs.score}</p>
                            <p className="text-xs text-white/40 mb-1">/100 Risk Score</p>
                        </div>
                        {/* Mini gauge bar */}
                        <div className="mt-3 h-2 bg-surface-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${crs.score}%` }}
                                transition={{ delay: 0.8 + i * 0.1, duration: 1 }}
                                className={`h-full rounded-full ${crs.score >= 70 ? 'bg-severity-critical' :
                                        crs.score >= 50 ? 'bg-severity-high' :
                                            crs.score >= 30 ? 'bg-severity-medium' : 'bg-severity-low'
                                    }`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Sankey Diagram */}
            <SankeyDiagram data={filteredData} />

            {/* Recent Anomalies Feed */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="section-title">Recent Anomaly Alerts</h3>
                        <p className="section-subtitle">{anomalies.length} anomalies detected in current view</p>
                    </div>
                    <a href="/dashboard/anomalies" className="text-sm text-gold-400 hover:underline">View All →</a>
                </div>
                <div className="space-y-3">
                    {topAnomalies.map((anomaly, i) => (
                        <AnomalyCard key={anomaly.id} anomaly={anomaly} delay={i} />
                    ))}
                    {topAnomalies.length === 0 && (
                        <p className="text-white/30 text-sm py-8 text-center">No anomalies detected for current filters</p>
                    )}
                </div>
            </div>
        </div>
    );
}
