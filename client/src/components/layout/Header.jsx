import { useFilterContext } from '../../context/FilterContext';
import { FISCAL_YEARS, QUARTERS, DIVISIONS, DEPARTMENTS } from '../../config/constants';
import { Bell, Filter } from 'lucide-react';
import { APP_TAGLINE } from '../../config/constants';

export default function Header() {
    const { filters, updateFilter, analysis } = useFilterContext();

    return (
        <header className="h-16 bg-surface-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Title */}
            <div>
                <p className="text-xs text-white/40 uppercase tracking-widest">{APP_TAGLINE}</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white/40 mr-2">
                    <Filter size={14} />
                    <span className="text-xs">Filters:</span>
                </div>

                {/* Fiscal Year */}
                <select
                    value={filters.fiscalYear || ''}
                    onChange={(e) => updateFilter('fiscalYear', e.target.value || null)}
                    className="bg-surface-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                    <option value="">All Years</option>
                    {FISCAL_YEARS.map((fy) => (
                        <option key={fy} value={fy}>FY {fy}</option>
                    ))}
                </select>

                {/* Quarter */}
                <select
                    value={filters.quarter || ''}
                    onChange={(e) => updateFilter('quarter', e.target.value || null)}
                    className="bg-surface-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                    <option value="">All Quarters</option>
                    {QUARTERS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                    ))}
                </select>

                {/* Division */}
                <select
                    value={filters.division || ''}
                    onChange={(e) => updateFilter('division', e.target.value || null)}
                    className="bg-surface-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                    <option value="">All Divisions</option>
                    {Object.entries(DIVISIONS).map(([id, div]) => (
                        <option key={id} value={id}>{div.name}</option>
                    ))}
                </select>

                {/* Anomaly alert bell */}
                <div className="relative ml-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                        <Bell size={20} className="text-white/60" />
                        {analysis && analysis.criticalCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-severity-critical rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                                {analysis.criticalCount > 9 ? '9+' : analysis.criticalCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
