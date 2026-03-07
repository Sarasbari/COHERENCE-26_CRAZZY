import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, ShieldCheck, Lock, Landmark,
    CheckCircle2, Link2, Leaf, Sprout, Wheat
} from 'lucide-react';
import { useFilterContext } from '../context/FilterContext';

/* ═══════════════════════════════════════════════════════════════
   DATA – Base config for divisions
   ═══════════════════════════════════════════════════════════════ */

const DIVISIONS_CONFIG = {
    amravati: {
        name: 'AMRAVATI',
        focus: 'Cotton Belt + Irrigation + Rural Dev',
        color: '#16A34A',
        icon: Leaf,
        prevHash: '0x2e...0b12',
        currHash: '5c77...f954'
    },
    aurangabad: {
        name: 'AURANGABAD',
        focus: 'Marathwada Dev. + Water Grid + Edu',
        color: '#3B82F6',
        icon: Wheat,
        prevHash: '0206...1340',
        currHash: '3463...6da7',
    },
    nagpur: {
        name: 'NAGPUR',
        focus: 'Vidarbha Irrigation + Metro + Industry',
        color: '#F59E0B',
        icon: Sprout,
        prevHash: '0b84...2965',
        currHash: '5977...158c',
    }
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATION PRESETS
   ═══════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Secured Badge
   ═══════════════════════════════════════════════════════════════ */

function SecuredBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[11px] font-bold tracking-wide">
            <CheckCircle2 size={12} />
            SECURED
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Hash Row
   ═══════════════════════════════════════════════════════════════ */

function HashRow({ prev, curr, light = false }) {
    return (
        <div className={`flex items-center gap-5 text-[11px] font-mono mt-2.5 ${light ? 'text-white/40' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1.5">
                <Link2 size={10} className={light ? 'text-white/30' : 'text-slate-300'} />
                prev: <span className={light ? 'text-white/55' : 'text-slate-500'}>{prev}</span>
            </span>
            <span className="flex items-center gap-1.5">
                curr: <span className={light ? 'text-white/55' : 'text-slate-500'}>{curr}</span>
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Pulsing Glow Dot (on connector endpoints)
   ═══════════════════════════════════════════════════════════════ */

function GlowDot({ color, size = 12, className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: size * 2.5,
                    height: size * 2.5,
                    backgroundColor: `${color}20`,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
                className="relative rounded-full border-2 bg-white z-10"
                style={{ width: size, height: size, borderColor: color }}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Vertical Connector with animated particles
   ═══════════════════════════════════════════════════════════════ */

function VerticalConnector({ height = 60, color = '#6366F1', delay = 0 }) {
    return (
        <div className="flex flex-col items-center" style={{ height }}>
            <motion.div
                className="relative flex-1 overflow-hidden"
                style={{ width: 3 }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay, duration: 0.6, ease }}
            >
                {/* Base line */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${color}40` }}
                />
                {/* Flowing particle */}
                <motion.div
                    className="absolute left-0 right-0 rounded-full"
                    style={{ height: 18, background: `linear-gradient(180deg, transparent, ${color}, transparent)` }}
                    animate={{ top: ['-20px', `${height}px`] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: delay + 0.6, ease: 'linear' }}
                />
            </motion.div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Tree Branch Connector (Treasury → Divisions)
   ═══════════════════════════════════════════════════════════════ */

function TreeBranch({ delay = 0.8 }) {
    return (
        <div className="relative w-full" style={{ height: 90 }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 90" preserveAspectRatio="xMidYMid meet">
                {/* Main vertical trunk */}
                <motion.line
                    x1="500" y1="0" x2="500" y2="35"
                    stroke="#6366F1" strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay, duration: 0.4, ease }}
                />

                {/* Horizontal rail */}
                <motion.line
                    x1="167" y1="35" x2="833" y2="35"
                    stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: delay + 0.3, duration: 0.5, ease }}
                />

                {/* Branch to Amravati (left) */}
                <motion.line
                    x1="167" y1="35" x2="167" y2="90"
                    stroke={DIVISIONS_CONFIG.amravati.color} strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: delay + 0.6, duration: 0.3, ease }}
                />

                {/* Branch to Aurangabad (center) */}
                <motion.line
                    x1="500" y1="35" x2="500" y2="90"
                    stroke={DIVISIONS_CONFIG.aurangabad.color} strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: delay + 0.7, duration: 0.3, ease }}
                />

                {/* Branch to Nagpur (right) */}
                <motion.line
                    x1="833" y1="35" x2="833" y2="90"
                    stroke={DIVISIONS_CONFIG.nagpur.color} strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ delay: delay + 0.8, duration: 0.3, ease }}
                />

                {/* Node dots */}
                {[
                    { x: 167, color: DIVISIONS_CONFIG.amravati.color, d: 0.7 },
                    { x: 500, color: DIVISIONS_CONFIG.aurangabad.color, d: 0.8 },
                    { x: 833, color: DIVISIONS_CONFIG.nagpur.color, d: 0.9 },
                ].map((n, i) => (
                    <g key={i}>
                        {/* Outer glow ring */}
                        <motion.circle
                            cx={n.x} cy="35" r="12"
                            fill={`${n.color}15`} stroke={n.color} strokeWidth="1.5" strokeOpacity="0.3"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: delay + n.d }}
                        />
                        {/* Inner dot */}
                        <motion.circle
                            cx={n.x} cy="35" r="5"
                            fill="white" stroke={n.color} strokeWidth="2.5"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: delay + n.d + 0.1 }}
                        />
                    </g>
                ))}

                {/* Animated pulse particles flowing on horizontal rail */}
                {[0, 1, 2].map((i) => (
                    <motion.circle
                        key={`pulse-${i}`}
                        cy="35" r="3" fill="#6366F1" opacity="0.6"
                        animate={{ cx: [167, 833] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: delay + 1.2 + i * 0.8,
                            ease: 'linear',
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Ministry Card (Top)
   ═══════════════════════════════════════════════════════════════ */

function MinistryCard({ totalBudgetStr, fyDisplayString }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="relative mx-auto max-w-xl"
        >
            <div
                className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-7 py-6 overflow-hidden"
                style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)' }}
            >
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '20px 20px',
                    }}
                />
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                            <Landmark size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-base font-bold text-white">Ministry of Finance, GoI</h3>
                                <SecuredBadge />
                            </div>
                            <p className="text-xs text-white/40 mt-1">Tax Devolution ({fyDisplayString} • 15th FC)</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-white/50">₹</span>
                            {totalBudgetStr}
                            <span className="text-sm font-bold text-white/50">Cr</span>
                        </p>
                    </div>
                </div>

                <HashRow prev="0808001...80880E0" curr="8e4e5c...89fe85" light />
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – State Treasury Card
   ═══════════════════════════════════════════════════════════════ */

function TreasuryCard({ totalBudgetStr, fyDisplayString }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease }}
            className="relative mx-auto max-w-lg"
        >
            <div
                className="relative rounded-2xl border-2 border-indigo-200/70 bg-white px-7 py-5 overflow-hidden"
                style={{ boxShadow: '0 12px 40px -8px rgba(99,102,241,0.15), 0 4px 12px rgba(0,0,0,0.04)' }}
            >
                {/* Background shimmer */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/50 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
                />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Building2 size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-base font-bold text-slate-800">Maharashtra State Treasury</h3>
                                <SecuredBadge />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">State Budget Distribution {fyDisplayString}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1">
                            <span className="text-sm font-bold text-slate-400">₹</span>
                            {totalBudgetStr}
                            <span className="text-sm font-bold text-slate-400">Cr</span>
                        </p>
                    </div>
                </div>

                <HashRow prev="0a4c9c...89fd05" curr="a29c7d...bbc631" />
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT – Division Card
   ═══════════════════════════════════════════════════════════════ */

function DivisionCard({ division, delay }) {
    const [hover, setHover] = useState(false);
    const DivIcon = division.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, ease }}
            className="relative"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <motion.div
                className="relative rounded-2xl bg-white overflow-hidden cursor-default"
                animate={{
                    y: hover ? -6 : 0,
                    boxShadow: hover
                        ? `0 20px 40px -12px ${division.color}30, 0 4px 12px rgba(0,0,0,0.06)`
                        : `0 4px 20px -4px ${division.color}10, 0 1px 3px rgba(0,0,0,0.04)`,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                    borderLeft: `4px solid ${division.color}`,
                    borderTop: `1px solid ${division.color}20`,
                    borderRight: `1px solid ${division.color}20`,
                    borderBottom: `1px solid ${division.color}20`,
                }}
            >
                {/* Hover glow overlay */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${division.color}08, transparent)` }}
                    animate={{ opacity: hover ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />

                {/* Verified badge top-right */}
                <div className="absolute top-3 right-3">
                    <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${division.color}10`, border: `1.5px solid ${division.color}25` }}
                        animate={{ rotate: hover ? 360 : 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <ShieldCheck size={15} style={{ color: division.color }} />
                    </motion.div>
                </div>

                <div className="p-5 pt-4">
                    {/* Icon + Name */}
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${division.color}12` }}
                        >
                            <DivIcon size={14} style={{ color: division.color }} />
                        </div>
                        <h4
                            className="text-xs font-extrabold tracking-widest"
                            style={{ color: division.color }}
                        >
                            {division.name}
                        </h4>
                    </div>

                    {/* Amount */}
                    <p className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight">
                        {division.amount}
                    </p>

                    {/* Focus */}
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                        {division.focus}
                    </p>

                    {/* Hash info */}
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300">
                            <span className="uppercase text-slate-400 font-sans font-bold text-[9px] w-8">PREV</span>
                            <span>{division.prevHash}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300">
                            <span className="uppercase text-slate-400 font-sans font-bold text-[9px] w-8">CURR</span>
                            <span>{division.currHash}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function BudgetOverview() {
    const { filteredData, filters, meta } = useFilterContext();

    // Sum across divisions purely for budget tracking (exclude environment data since it's sqkm)
    const metrics = { amravati: 0, aurangabad: 0, nagpur: 0 };
    let totalBudgetCrores = 0;

    if (filteredData) {
        filteredData.forEach(item => {
            if (item._source !== 'maharashtra_environment_real') {
                const divId = item.division;
                const allocVal = parseFloat(item.allocated) || 0;

                if (metrics[divId] !== undefined) {
                    metrics[divId] += allocVal;
                }
                totalBudgetCrores += allocVal;
            }
        });
    }

    const totalBudgetStr = totalBudgetCrores.toLocaleString('en-IN', { maximumFractionDigits: 1 });

    const dynamicDivisions = Object.keys(DIVISIONS_CONFIG).map(id => ({
        id,
        ...DIVISIONS_CONFIG[id],
        amount: `₹${metrics[id].toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`
    }));

    // Construct the active Fiscal Year display string based on context state
    let fyDisplayString = "All Years";
    if (filters?.fiscalYear) {
        fyDisplayString = filters.fiscalYear.startsWith("All") ? filters.fiscalYear : `FY ${filters.fiscalYear}`;
    } else if (meta?.fiscalYears?.length) {
        const sortedYears = [...meta.fiscalYears].filter(y => !y.startsWith('All')).sort();
        if (sortedYears.length > 0) {
            fyDisplayString = `FY ${sortedYears[0]} to FY ${sortedYears[sortedYears.length - 1]}`;
        }
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16 overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-50/40 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto px-6 pt-6 pb-4 relative z-10"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Landmark size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            Budget Overview
                        </h1>
                        <p className="text-xs text-slate-400">
                            Maharashtra • {fyDisplayString} • Blockchain-verified fund flow
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Flow Content */}
            <div className="relative max-w-5xl mx-auto px-6 pt-4 z-10 flex flex-col items-center">
                {/* Ministry of Finance */}
                <MinistryCard totalBudgetStr={totalBudgetStr} fyDisplayString={fyDisplayString} />

                {/* Animated vertical connector */}
                <VerticalConnector height={60} color="#6366F1" delay={0.3} />

                {/* State Treasury */}
                <TreasuryCard totalBudgetStr={totalBudgetStr} fyDisplayString={fyDisplayString} />

                {/* Tree Branch Connector */}
                <TreeBranch delay={0.9} />

                {/* Division Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full relative z-10">
                    {dynamicDivisions.map((div, idx) => (
                        <DivisionCard
                            key={div.id}
                            division={div}
                            delay={1.4 + idx * 0.15}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="max-w-5xl mx-auto px-6 mt-10 relative z-10"
            >
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-300">
                    <Lock size={11} />
                    <span>On-chain verified • Maharashtra Finance Dept • Synced {new Date().toLocaleDateString('en-IN')}</span>
                </div>
            </motion.div>
        </div>
    );
}
