import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    motion,
    AnimatePresence,
    useSpring,
    useTransform,
    useMotionValue,
} from 'framer-motion';
import {
    IndianRupee,
    Leaf,
    TrendingUp,
    Droplets,
    AlertTriangle,
    ExternalLink,
    Activity,
    Building2,
    ShieldCheck,
    Sprout,
    MapPin,
    Layers,
    BarChart3,
    Clock,
    Loader2,
    Database,
    Wifi,
    WifiOff,
    ChevronDown,
    Users,
    Wheat,
    Landmark,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { db } from '../config/firebase';
import { fetchAllData } from '../services/firebaseService';

/* ═══════════════════════════════════════════════════════════════
   §1  FIREBASE DATA HOOK
   ═══════════════════════════════════════════════════════════════ */

const FALLBACK_DIVISIONS = [
    {
        id: 'amravati',
        name: 'Amravati Division',
        color: '#16A34A',
        colorLight: '#DCFCE7',
        icon: Leaf,
        totalAllocated: 285400,
        totalSpent: 210196,
        utilization: 73.6,
        leakage: 3.2,
        topCrop: 'Cotton',
        districts: ['Amravati', 'Akola', 'Yavatmal'],
        farmerCount: 328800,
        schemes: [
            { name: 'PM-KISAN', sanctioned: 27600, spent: 26220, utilization: 95 },
            { name: 'PMFBY', sanctioned: 37200, spent: 30132, utilization: 81 },
            { name: 'Namo Shetkari', sanctioned: 11400, spent: 10830, utilization: 95 },
            { name: 'PMKSY Irrigation', sanctioned: 8800, spent: 6417, utilization: 73 },
        ],
    },
    {
        id: 'nagpur',
        name: 'Nagpur Division',
        color: '#F59E0B',
        colorLight: '#FEF3C7',
        icon: Sprout,
        totalAllocated: 196800,
        totalSpent: 166360,
        utilization: 84.5,
        leakage: 1.8,
        topCrop: 'Orange',
        districts: ['Nagpur', 'Chandrapur'],
        farmerCount: 218400,
        schemes: [
            { name: 'PM-KISAN', sanctioned: 17400, spent: 16530, utilization: 95 },
            { name: 'MIDH Horticulture', sanctioned: 13400, spent: 10251, utilization: 76.5 },
            { name: 'Namo Shetkari', sanctioned: 6960, spent: 6612, utilization: 95 },
        ],
    },
    {
        id: 'aurangabad',
        name: 'Aurangabad Division',
        color: '#3B82F6',
        colorLight: '#DBEAFE',
        icon: Wheat,
        totalAllocated: 358200,
        totalSpent: 271438,
        utilization: 75.8,
        leakage: 2.6,
        topCrop: 'Soybean',
        districts: ['Aurangabad', 'Latur', 'Nanded'],
        farmerCount: 504000,
        schemes: [
            { name: 'PM-KISAN', sanctioned: 71400, spent: 67830, utilization: 95 },
            { name: 'Namo Shetkari', sanctioned: 24960, spent: 23712, utilization: 95 },
            { name: 'PMFBY', sanctioned: 37200, spent: 30132, utilization: 81 },
            { name: 'Nanaji Deshmukh', sanctioned: 13200, spent: 10567, utilization: 80 },
        ],
    },
];

function useBudgetData() {
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db) {
            setDivisions(FALLBACK_DIVISIONS);
            setLoading(false);
            setIsLive(false);
            return;
        }

        async function fetchData() {
            try {
                // Fetch all data across all collections
                const { records } = await fetchAllData();

                // Aggregate by division
                const divMap = {};
                records.forEach((r) => {
                    const divName = r.divisionName.replace(' Division', '');
                    if (!divMap[divName]) {
                        divMap[divName] = {
                            totalAllocated: 0,
                            totalSpent: 0,
                            districts: new Set(),
                            schemes: {},
                            farmerCount: 0,
                            topCrop: '',
                        };
                    }

                    divMap[divName].totalAllocated += r.allocated;
                    divMap[divName].totalSpent += r.spent;
                    if (r.district) divMap[divName].districts.add(r.district);

                    // Extract raw specific fields mapping to different schemes
                    if (r._raw) {
                        if (r._raw.farmer_count) divMap[divName].farmerCount += r._raw.farmer_count;
                        if (r._raw.crop) divMap[divName].topCrop = r._raw.crop;

                        const schemeName = r._raw.scheme_name || (r._source === 'maharashtra_health_budget' ? 'NHM Govt Health' : 'General State Fund');
                        if (!divMap[divName].schemes[schemeName]) {
                            divMap[divName].schemes[schemeName] = { sanctioned: 0, spent: 0 };
                        }
                        divMap[divName].schemes[schemeName].sanctioned += r.allocated;
                        divMap[divName].schemes[schemeName].spent += r.spent;
                    }
                });

                const colors = { Amravati: '#16A34A', Nagpur: '#F59E0B', Aurangabad: '#3B82F6', Konkan: '#8B5CF6', Pune: '#EC4899', Nashik: '#06B6D4' };
                const colorLights = { Amravati: '#DCFCE7', Nagpur: '#FEF3C7', Aurangabad: '#DBEAFE', Konkan: '#F3E8FF', Pune: '#FCE7F3', Nashik: '#CFFAFE' };
                const icons = { Amravati: Leaf, Nagpur: Sprout, Aurangabad: Wheat, Konkan: Building2, Pune: ShieldCheck, Nashik: Landmark };

                const result = Object.entries(divMap).map(([name, data]) => {
                    const util = data.totalAllocated > 0
                        ? ((data.totalSpent / data.totalAllocated) * 100)
                        : 0;

                    const leak = Math.max(0, 100 - util - (Math.random() * 5 + 92 - (100 - util)));

                    const mappedSchemes = Object.entries(data.schemes).map(([sn, sv]) => ({
                        name: sn,
                        sanctioned: sv.sanctioned,
                        spent: sv.spent,
                        utilization: sv.sanctioned > 0 ? ((sv.spent / sv.sanctioned) * 100) : 0,
                    }));

                    return {
                        id: name.toLowerCase(),
                        name: `${name} Division`,
                        color: colors[name] || '#8B5CF6',
                        colorLight: colorLights[name] || '#F3E8FF',
                        icon: icons[name] || Landmark,
                        totalAllocated: data.totalAllocated,
                        totalSpent: data.totalSpent,
                        utilization: parseFloat(util.toFixed(1)),
                        leakage: parseFloat(Math.max(0, 100 - util).toFixed(1)),
                        topCrop: data.topCrop || 'Mixed',
                        districts: Array.from(data.districts),
                        farmerCount: data.farmerCount,
                        schemes: mappedSchemes.sort((a, b) => b.sanctioned - a.sanctioned).slice(0, 5),
                    };
                });

                setDivisions(result.length > 0 ? result : FALLBACK_DIVISIONS);
                setIsLive(result.length > 0);
                setLoading(false);
            } catch (err) {
                console.warn('Firebase fetch failed, using fallback:', err.message);
                setDivisions(FALLBACK_DIVISIONS);
                setIsLive(false);
                setError(err.message);
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const totals = useMemo(() => {
        const alloc = divisions.reduce((s, d) => s + d.totalAllocated, 0);
        const spent = divisions.reduce((s, d) => s + d.totalSpent, 0);
        const farmers = divisions.reduce((s, d) => s + d.farmerCount, 0);
        const avgUtil = divisions.length > 0
            ? divisions.reduce((s, d) => s + d.utilization, 0) / divisions.length
            : 0;
        return { alloc, spent, farmers, avgUtil: parseFloat(avgUtil.toFixed(1)) };
    }, [divisions]);

    return { divisions, totals, loading, isLive, error };
}

/* ═══════════════════════════════════════════════════════════════
   §2  ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════ */

const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

function Counter({ to, duration = 2, prefix = '', suffix = '', className = '' }) {
    const mv = useMotionValue(0);
    const spring = useSpring(mv, { stiffness: 40, damping: 18, duration: duration * 1000 });
    const display = useTransform(spring, (v) => `${prefix}${fmt(Math.round(v))}${suffix}`);
    const [text, setText] = useState(`${prefix}0${suffix}`);

    useEffect(() => { mv.set(to); }, [to, mv]);
    useEffect(() => {
        const unsub = display.on('change', (v) => setText(v));
        return unsub;
    }, [display]);

    return <span className={className}>{text}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   §3  PARTICLE SYSTEMS
   ═══════════════════════════════════════════════════════════════ */

function ParticleFlow({ color, count = 10 }) {
    const particles = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                size: 4 + Math.random() * 5,
                left: 15 + Math.random() * 70,
                delay: i * 0.2,
                dur: 1.4 + Math.random() * 1.2,
                opacity: 0.5 + Math.random() * 0.5,
            })),
        [count]
    );
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        background: `radial-gradient(circle, ${color}, ${color}88)`,
                        left: `${p.left}%`,
                        opacity: p.opacity,
                        boxShadow: `0 0 ${p.size * 2}px ${color}60`,
                    }}
                    animate={{
                        y: ['-10%', '115%'],
                        scale: [0.7, 1.3, 0.7],
                        opacity: [0.2, p.opacity, 0.2],
                    }}
                    transition={{
                        duration: p.dur,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

function LeakageDrops({ color = '#EF4444', count = 6 }) {
    const drops = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                x: Math.random() * 20,
                delay: i * 0.4,
                dur: 1 + Math.random() * 0.8,
            })),
        [count]
    );
    return (
        <div className="absolute -right-5 top-1/3 w-12 h-24 pointer-events-none">
            {drops.map((d) => (
                <motion.div
                    key={d.id}
                    className="absolute w-[5px] h-[5px] rounded-full"
                    style={{
                        backgroundColor: color,
                        left: d.x,
                        boxShadow: `0 0 8px ${color}80`,
                    }}
                    animate={{
                        y: [0, 50 + Math.random() * 30],
                        x: [0, 6 + Math.random() * 10],
                        opacity: [0.9, 0],
                        scale: [1, 0.2],
                    }}
                    transition={{
                        duration: d.dur,
                        repeat: Infinity,
                        delay: d.delay,
                        ease: 'easeIn',
                    }}
                />
            ))}
        </div>
    );
}

function Bubbles({ color, count = 4 }) {
    const bubbles = useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                id: i,
                size: 3 + Math.random() * 4,
                left: 20 + Math.random() * 60,
                delay: i * 0.8 + Math.random() * 2,
                dur: 2 + Math.random() * 2,
            })),
        [count]
    );
    return (
        <>
            {bubbles.map((b) => (
                <motion.div
                    key={b.id}
                    className="absolute rounded-full border"
                    style={{
                        width: b.size,
                        height: b.size,
                        borderColor: `${color}50`,
                        left: `${b.left}%`,
                        bottom: '10%',
                    }}
                    animate={{
                        y: [0, -40 - Math.random() * 30],
                        opacity: [0.6, 0],
                        scale: [1, 1.5],
                    }}
                    transition={{
                        duration: b.dur,
                        repeat: Infinity,
                        delay: b.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════
   §4  RADIAL PROGRESS RING
   ═══════════════════════════════════════════════════════════════ */

function RadialProgress({ pct, color, size = 72, strokeWidth = 5, delay = 0 }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-100"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
                    transition={{ delay, duration: 1.6, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   §5  LOADING SKELETON
   ═══════════════════════════════════════════════════════════════ */

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center gap-6 p-8">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 size={40} className="text-blue-500" />
            </motion.div>
            <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">Loading Budget Data</p>
                <p className="text-sm text-slate-400 mt-1">Fetching from Firebase Firestore…</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="h-32 rounded-2xl bg-white/80 border border-slate-100"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   §6  KPI CARD (GLASSMORPHISM)
   ═══════════════════════════════════════════════════════════════ */

function KPICard({ icon: Icon, label, value, prefix, suffix, color, sub, trend, delay = 0 }) {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
            className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 group hover:-translate-y-1 transition-transform duration-300"
            style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
            {/* Accent blob */}
            <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-2xl group-hover:opacity-25 transition-opacity"
                style={{ backgroundColor: color }}
            />
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
                >
                    <Icon size={20} style={{ color }} />
                </div>
                {trend && (
                    <span
                        className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: isPositive ? '#DCFCE7' : '#FEF2F2',
                            color: isPositive ? '#16A34A' : '#DC2626',
                        }}
                    >
                        <TrendIcon size={11} />
                        {sub}
                    </span>
                )}
            </div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-slate-800 tabular-nums leading-tight">
                <Counter to={value} prefix={prefix} suffix={suffix} />
            </p>
            {!trend && sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   §7  SCHEME CARD
   ═══════════════════════════════════════════════════════════════ */

function SchemeCard({ scheme, color, delay = 0 }) {
    const pct = scheme.utilization.toFixed(0);
    const barColor = scheme.utilization >= 90 ? '#16A34A' : scheme.utilization >= 75 ? color : '#F59E0B';
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.35 }}
            className="rounded-xl border border-slate-100 bg-white/60 backdrop-blur-sm p-3.5 hover:border-slate-200 transition-colors"
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700 truncate flex-1">{scheme.name}</p>
                <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2"
                    style={{
                        backgroundColor: `${barColor}15`,
                        color: barColor,
                        border: `1px solid ${barColor}30`,
                    }}
                >
                    {pct}%
                </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                <span>₹{fmt(scheme.sanctioned)} L alloc</span>
                <span>•</span>
                <span>₹{fmt(scheme.spent)} L spent</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, scheme.utilization)}%` }}
                    transition={{ delay: delay + 0.2, duration: 1, ease: 'easeOut' }}
                />
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   §8  SECTOR PIPELINE (VISUAL CORE)
   ═══════════════════════════════════════════════════════════════ */

function SectorPipeline({ division, delay = 0 }) {
    const [hover, setHover] = useState(false);
    const DivIcon = division.icon;
    const c = division.color;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, type: 'spring', stiffness: 70 }}
            className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px -8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)' }}
        >
            {/* ── Header ── */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${c}15`, border: `1px solid ${c}25` }}
                    >
                        <DivIcon size={20} style={{ color: c }} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">{division.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin size={10} />
                                {division.districts.join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
                <RadialProgress pct={division.utilization} color={c} delay={delay + 0.4} />
            </div>

            {/* ── Quick stats bar ── */}
            <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                {[
                    { label: 'Allocated', val: `₹${fmt(division.totalAllocated)} L`, icon: Layers },
                    { label: 'Spent', val: `₹${fmt(division.totalSpent)} L`, icon: BarChart3 },
                    { label: 'Farmers', val: fmt(division.farmerCount), icon: Users },
                ].map((s, i) => (
                    <div
                        key={s.label}
                        className="rounded-lg bg-slate-50/80 border border-slate-100 px-3 py-2.5 text-center"
                    >
                        <s.icon size={13} className="mx-auto mb-1 text-slate-400" />
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">{s.val}</p>
                    </div>
                ))}
            </div>

            {/* ── Pipeline Visual ── */}
            <div className="flex flex-col items-center py-2 relative">
                {/* Funnel */}
                <motion.div
                    className="relative"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: delay + 0.3, duration: 0.5 }}
                    style={{ transformOrigin: 'top' }}
                >
                    <div
                        className="w-36 h-14"
                        style={{
                            clipPath: 'polygon(2% 0%, 98% 0%, 72% 100%, 28% 100%)',
                            background: `linear-gradient(180deg, ${c}50, ${c}90)`,
                            boxShadow: `0 4px 16px ${c}30`,
                        }}
                    />
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white tracking-widest">
                        INFLOW
                    </span>
                </motion.div>

                {/* Pipe */}
                <div
                    className="relative w-9 h-28 overflow-hidden"
                    style={{
                        background: `linear-gradient(90deg, ${c}15, ${c}30, ${c}15)`,
                        borderLeft: `1px solid ${c}25`,
                        borderRight: `1px solid ${c}25`,
                    }}
                >
                    <ParticleFlow color={c} count={8} />
                </div>

                {/* Reservoir */}
                <div
                    className="relative w-48 h-44 rounded-b-3xl rounded-t-lg border-2 overflow-hidden cursor-pointer group/tank"
                    style={{ borderColor: `${c}40`, background: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {/* Liquid fill */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0"
                        style={{ backgroundColor: `${c}25` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${division.utilization}%` }}
                        transition={{ delay: delay + 0.9, duration: 1.8, ease: 'easeOut' }}
                    >
                        {/* Wave */}
                        <motion.div
                            className="absolute -top-1 left-0 right-0 h-4"
                            style={{
                                background: `linear-gradient(90deg, transparent 0%, ${c}40 20%, transparent 40%, ${c}40 60%, transparent 80%, ${c}40 100%)`,
                                backgroundSize: '200% 100%',
                            }}
                            animate={{ backgroundPositionX: ['0%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        />
                        {/* Bubbles inside liquid */}
                        <Bubbles color={c} count={5} />
                    </motion.div>

                    {/* Tank label / hover tooltip */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <AnimatePresence mode="wait">
                            {hover ? (
                                <motion.div
                                    key="detail"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    className="text-center px-3 py-2 rounded-xl"
                                    style={{ backgroundColor: `${c}12` }}
                                >
                                    <p className="text-2xl font-black" style={{ color: c }}>
                                        {division.utilization}%
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-500">Fund Utilized</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Top: {division.topCrop}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="label"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    className="text-center"
                                >
                                    <Droplets size={18} className="mx-auto mb-1" style={{ color: c }} />
                                    <p className="text-[11px] font-semibold text-slate-500">State Treasury</p>
                                    <p className="text-[9px] text-slate-400">{division.topCrop} Belt</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Leakage crack */}
                    <LeakageDrops color="#EF4444" count={5} />
                </div>

                {/* Leakage badge */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 1.8, duration: 0.4 }}
                    className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border"
                    style={{
                        backgroundColor: 'rgba(254,226,226,0.5)',
                        borderColor: '#FECACA',
                    }}
                >
                    <AlertTriangle size={11} className="text-red-500" />
                    <span className="text-[10px] font-bold text-red-600">
                        Gap {division.leakage}%
                    </span>
                </motion.div>

                {/* Drain pipe */}
                <div
                    className="w-7 h-8"
                    style={{
                        background: `linear-gradient(90deg, ${c}15, ${c}25, ${c}15)`,
                        borderLeft: `1px solid ${c}20`,
                        borderRight: `1px solid ${c}20`,
                    }}
                />

                {/* Horizontal manifold */}
                <motion.div
                    className="w-full h-5 rounded-full overflow-hidden relative"
                    style={{ backgroundColor: `${c}10` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: delay + 1.3, duration: 0.5 }}
                >
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${c}30, transparent)`,
                            backgroundSize: '200% 100%',
                        }}
                        animate={{ backgroundPositionX: ['0%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                </motion.div>
            </div>

            {/* ── Scheme cards ── */}
            {division.schemes.length > 0 && (
                <div className="px-5 pb-5 space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
                        Government Schemes
                    </p>
                    {division.schemes.map((s, i) => (
                        <SchemeCard key={s.name} scheme={s} color={c} delay={delay + 1.2 + i * 0.1} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   §9  MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function BudgetFlowVisualization() {
    const { divisions, totals, loading, isLive, error } = useBudgetData();

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 pb-12 relative overflow-hidden">
            {/* Background decorative blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-amber-100/20 rounded-full blur-[120px] pointer-events-none" />

            {/* ── Header ── */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2 relative z-10"
            >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Activity size={20} className="text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Budget Flow Intelligence
                            </h1>
                        </div>
                        <p className="text-sm text-slate-400 ml-[52px]">
                            Maharashtra Agriculture • FY 2025-26 • Real-time fund flow
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border"
                            style={{
                                backgroundColor: isLive ? '#F0FDF4' : '#FFF7ED',
                                borderColor: isLive ? '#BBF7D0' : '#FED7AA',
                                color: isLive ? '#16A34A' : '#EA580C',
                            }}
                        >
                            {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
                            {isLive ? 'Live from Firebase' : 'Cached Data'}
                        </span>
                        <a
                            href="https://data.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50/50"
                        >
                            data.gov.in <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-6 relative z-10">
                {/* ── KPI Row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        icon={IndianRupee}
                        label="Total Budget"
                        value={totals.alloc}
                        prefix="₹"
                        suffix=" L"
                        color="#1E40AF"
                        sub="FY 2025-26"
                        delay={0.1}
                    />
                    <KPICard
                        icon={BarChart3}
                        label="Total Expenditure"
                        value={totals.spent}
                        prefix="₹"
                        suffix=" L"
                        color="#16A34A"
                        sub="+12%"
                        trend="up"
                        delay={0.2}
                    />
                    <KPICard
                        icon={Users}
                        label="Beneficiary Farmers"
                        value={totals.farmers}
                        color="#F59E0B"
                        sub={`${divisions.length} divisions`}
                        delay={0.3}
                    />
                    <KPICard
                        icon={TrendingUp}
                        label="Avg Utilization"
                        value={totals.avgUtil}
                        suffix="%"
                        color="#8B5CF6"
                        sub="+4.2%"
                        trend="up"
                        delay={0.4}
                    />
                </div>

                {/* ── Division Pipelines ── */}
                <div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2 mb-5"
                    >
                        <Zap size={16} className="text-amber-500" />
                        <h2 className="text-lg font-bold text-slate-800">Division Fund Pipelines</h2>
                        <span className="text-xs text-slate-400 ml-2">Hover tanks for utilization details</span>
                    </motion.div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {divisions.map((div, i) => (
                            <SectorPipeline key={div.id} division={div} delay={0.4 + i * 0.2} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-6 border-t border-slate-200/60 text-center relative z-10"
            >
                <p className="text-[11px] text-slate-400">
                    © {new Date().getFullYear()} ARTHRAKSHAK AI • Budget Flow Intelligence •
                    Data:{' '}
                    <a
                        href="https://data.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-slate-600"
                    >
                        data.gov.in
                    </a>{' '}
                    + Firebase Firestore
                </p>
            </motion.footer>
        </div>
    );
}
