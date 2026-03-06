import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';

export default function KPICard({ title, value, prefix = '', suffix = '', trend, icon: Icon, color = 'gold', delay = 0 }) {
    const colorMap = {
        gold: 'from-gold-500/20 to-gold-600/10 border-gold-500/20',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
        green: 'from-green-500/20 to-green-600/10 border-green-500/20',
        red: 'from-red-500/20 to-red-600/10 border-red-500/20',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    };

    const iconColorMap = {
        gold: 'text-gold-400',
        blue: 'text-blue-400',
        green: 'text-green-400',
        red: 'text-red-400',
        purple: 'text-purple-400',
    };

    const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
    const trendColor = trend?.direction === 'up' ? 'text-green-400' : trend?.direction === 'down' ? 'text-red-400' : 'text-white/40';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.5 }}
            className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5 backdrop-blur-sm`}
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-white/50 font-medium">{title}</p>
                {Icon && <Icon size={20} className={iconColorMap[color]} />}
            </div>

            <div className="flex items-end gap-2">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay * 0.1 + 0.3 }}
                    className="stat-number text-white"
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
