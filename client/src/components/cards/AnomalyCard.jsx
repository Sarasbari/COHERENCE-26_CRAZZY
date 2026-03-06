import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Zap, Ban, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const typeConfig = {
    underspending: { icon: TrendingDown, label: 'Underspending' },
    spike: { icon: Zap, label: 'Spending Spike' },
    zero_spend: { icon: Ban, label: 'Zero Spending' },
    release_gap: { icon: Clock, label: 'Release Gap' },
    lapse_risk: { icon: AlertTriangle, label: 'Fund Lapse Risk' },
    statistical_low: { icon: TrendingDown, label: 'Statistical Outlier (Low)' },
    statistical_high: { icon: Zap, label: 'Statistical Outlier (High)' },
};

export default function AnomalyCard({ anomaly, onClick, delay = 0 }) {
    const config = typeConfig[anomaly.type] || typeConfig.underspending;
    const TypeIcon = config.icon;

    const severityClass = {
        critical: 'badge-critical',
        high: 'badge-high',
        medium: 'badge-medium',
        low: 'badge-low',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay * 0.05 }}
            onClick={onClick}
            className="glass-card-hover p-4 cursor-pointer"
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${anomaly.severity === 'critical' ? 'bg-severity-critical/20' :
                        anomaly.severity === 'high' ? 'bg-severity-high/20' :
                            'bg-severity-medium/20'
                    }`}>
                    <TypeIcon size={18} className={
                        anomaly.severity === 'critical' ? 'text-severity-critical' :
                            anomaly.severity === 'high' ? 'text-severity-high' :
                                'text-severity-medium'
                    } />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={severityClass[anomaly.severity]}>{anomaly.severity}</span>
                        <span className="text-xs text-white/30">{config.label}</span>
                    </div>

                    <p className="text-sm text-white/80 mb-1.5 line-clamp-2">{anomaly.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-white/40">
                        <span>{anomaly.district}</span>
                        <span>•</span>
                        <span>{anomaly.departmentName}</span>
                        <span>•</span>
                        <span>FY {anomaly.fiscalYear} {anomaly.quarter}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-white/50">
                            Allocated: <span className="text-white/70 font-medium">{formatCurrency(anomaly.allocated)}</span>
                        </span>
                        <span className="text-white/50">
                            Spent: <span className="text-white/70 font-medium">{formatCurrency(anomaly.spent)}</span>
                        </span>
                        <span className="text-[10px] text-white/30 ml-auto">
                            Detected by: {anomaly.detectedBy}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
