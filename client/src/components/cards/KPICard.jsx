import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';

export default function KPICard({ title, value, prefix = '', suffix = '', trend, icon: Icon, color = 'blue', delay = 0 }) {
    const colorMap = {
        blue: 'from-[#1E3A8A]/10 to-[#3B82F6]/5 border-[#1E3A8A]/15',
        'light-blue': 'from-[#3B82F6]/10 to-[#60A5FA]/5 border-[#3B82F6]/15',
        green: 'from-[#16A34A]/10 to-[#16A34A]/5 border-[#16A34A]/15',
        red: 'from-[#DC2626]/10 to-[#DC2626]/5 border-[#DC2626]/15',
        purple: 'from-[#7C3AED]/10 to-[#7C3AED]/5 border-[#7C3AED]/15',
        gold: 'from-[#1E3A8A]/10 to-[#3B82F6]/5 border-[#1E3A8A]/15',
    };

    const iconColorMap = {
        blue: 'text-[#1E3A8A]',
        'light-blue': 'text-[#3B82F6]',
        green: 'text-[#16A34A]',
        red: 'text-[#DC2626]',
        purple: 'text-[#7C3AED]',
        gold: 'text-[#1E3A8A]',
    };

    const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
    const trendColor = trend?.direction === 'up' ? 'text-[#16A34A]' : trend?.direction === 'down' ? 'text-[#DC2626]' : 'text-[#64748B]';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.5 }}
            className={`bg-gradient-to-br ${colorMap[color] || colorMap.blue} bg-white border rounded-2xl p-5`}
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-[#64748B] font-medium">{title}</p>
                {Icon && <Icon size={20} className={iconColorMap[color] || iconColorMap.blue} />}
            </div>

            <div className="flex items-end gap-2">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay * 0.1 + 0.3 }}
                    className="stat-number text-[#0F172A]"
                >
                    {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
                </motion.p>
            </div>

            {trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
                    <TrendIcon size={14} />
                    <span>{trend.change?.toFixed(1)}% from last year</span>
                </div>
            )}
        </motion.div>
    );
}
