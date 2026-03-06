import { useState, useMemo } from 'react';
import { useFilterContext } from '../context/FilterContext';
import AnomalyCard from '../components/cards/AnomalyCard';
import { explainAnomaly } from '../services/groqService';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Filter, X, Brain, Loader2 } from 'lucide-react';

export default function Anomalies() {
    const { analysis, loading } = useFilterContext();
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);
    const [explanation, setExplanation] = useState('');
    const [explaining, setExplaining] = useState(false);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const anomalies = useMemo(() => {
        if (!analysis) return [];
        let filtered = [...analysis.anomalies];
        if (severityFilter !== 'all') filtered = filtered.filter(a => a.severity === severityFilter);
        if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
        return filtered.sort((a, b) => {
            const order = { critical: 4, high: 3, medium: 2, low: 1 };
            return order[b.severity] - order[a.severity];
        });
    }, [analysis, severityFilter, typeFilter]);

    const handleAnomalyClick = async (anomaly) => {
        setSelectedAnomaly(anomaly);
        setExplanation('');
        setExplaining(true);
        const result = await explainAnomaly(anomaly, { budgetSummary: analysis?.summary });
        setExplanation(result.message);
        setExplaining(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    const severityCounts = {
        critical: analysis?.anomalies.filter(a => a.severity === 'critical').length || 0,
        high: analysis?.anomalies.filter(a => a.severity === 'high').length || 0,
        medium: analysis?.anomalies.filter(a => a.severity === 'medium').length || 0,
        low: analysis?.anomalies.filter(a => a.severity === 'low').length || 0,
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-white mb-1">Anomaly Detection</h2>
                <p className="text-white/40 text-sm">Flagged issues from rule-based and statistical analysis</p>
            </motion.div>

            {/* Severity Summary */}
            <div className="grid grid-cols-4 gap-4">
                {['critical', 'high', 'medium', 'low'].map((sev) => (
                    <motion.button
                        key={sev}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                        className={`glass-card p-4 text-center cursor-pointer transition-all ${severityFilter === sev ? 'ring-2 ring-gold-500/50' : ''
                            }`}
                    >
                        <p className={`text-2xl font-bold text-severity-${sev}`}>{severityCounts[sev]}</p>
                        <p className="text-xs text-white/40 capitalize mt-1">{sev}</p>
                    </motion.button>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3">
                <Filter size={16} className="text-white/40" />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-surface-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                    <option value="all">All Types</option>
                    <option value="underspending">Underspending</option>
                    <option value="spike">Spending Spike</option>
                    <option value="zero_spend">Zero Spending</option>
                    <option value="release_gap">Release Gap</option>
                    <option value="statistical_low">Statistical Outlier (Low)</option>
                    <option value="statistical_high">Statistical Outlier (High)</option>
                </select>
                <span className="text-xs text-white/30">{anomalies.length} results</span>
            </div>

            {/* Anomaly List + Detail Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* List */}
                <div className="lg:col-span-3 space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {anomalies.map((anomaly, i) => (
                        <AnomalyCard
                            key={anomaly.id}
                            anomaly={anomaly}
                            onClick={() => handleAnomalyClick(anomaly)}
                            delay={i}
                        />
                    ))}
                    {anomalies.length === 0 && (
                        <div className="glass-card p-12 text-center">
                            <AlertTriangle size={40} className="mx-auto text-white/20 mb-3" />
                            <p className="text-white/40">No anomalies match current filters</p>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedAnomaly ? (
                            <motion.div
                                key={selectedAnomaly.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-card p-6 sticky top-24"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className={`badge-${selectedAnomaly.severity} mb-2`}>{selectedAnomaly.severity}</span>
                                        <h4 className="text-lg font-semibold text-white mt-2">{selectedAnomaly.departmentName}</h4>
                                        <p className="text-sm text-white/40">{selectedAnomaly.district} • FY {selectedAnomaly.fiscalYear} {selectedAnomaly.quarter}</p>
                                    </div>
                                    <button onClick={() => setSelectedAnomaly(null)} className="p-1 hover:bg-white/10 rounded-lg">
                                        <X size={18} className="text-white/40" />
                                    </button>
                                </div>

                                <p className="text-sm text-white/70 mb-4">{selectedAnomaly.description}</p>

                                {/* AI Explanation */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Brain size={16} className="text-gold-400" />
                                        <span className="text-sm font-medium text-gold-400">AI Analysis</span>
                                    </div>
                                    {explaining ? (
                                        <div className="flex items-center gap-2 text-white/40 text-sm">
                                            <Loader2 size={16} className="animate-spin" />
                                            Analyzing anomaly...
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{explanation || 'Click an anomaly to get AI-powered analysis'}</p>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center sticky top-24">
                                <Brain size={40} className="mx-auto text-white/20 mb-3" />
                                <p className="text-white/40 text-sm">Select an anomaly to view AI-powered analysis</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
