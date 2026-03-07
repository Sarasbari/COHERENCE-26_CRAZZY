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
            className="glass-card-hover p-3 md:p-4 cursor-pointer min-h-[44px]"
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${anomaly.severity === 'critical' ? 'bg-severity-critical/10' :
                    anomaly.severity === 'high' ? 'bg-severity-high/10' :
                        'bg-severity-medium/10'
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
                        <span className="text-xs text-[#94A3B8]">{config.label}</span>
                    </div>

                    <p className="text-sm text-[#0F172A] mb-1.5 line-clamp-2">{anomaly.description}</p>

                    <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-[11px] text-[#94A3B8]">
                        <span>{anomaly.district}</span>
                        <span>•</span>
                        <span>{anomaly.departmentName}</span>
                        <span>•</span>
                        <span>FY {anomaly.fiscalYear} {anomaly.quarter}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs">
                        <span className="text-[#64748B]">
                            Allocated: <span className="text-[#0F172A] font-medium">{formatCurrency(anomaly.allocated)}</span>
                        </span>
                        <span className="text-[#64748B]">
                            Spent: <span className="text-[#0F172A] font-medium">{formatCurrency(anomaly.spent)}</span>
                        </span>
                        <span className="text-[10px] text-[#94A3B8] ml-auto">
                            Detected by: {anomaly.detectedBy}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
