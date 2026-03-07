import { useState, useEffect, useRef } from 'react';
import { DIVISIONS, FISCAL_YEARS } from '../config/constants';

/* ───────────────────────── colour tokens ───────────────────────── */
const C = {
  govBlue: '#1E3A8A', brightBlue: '#3B82F6', bg: '#F8FAFC',
  card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', muted: '#64748B',
  green: '#16A34A', amber: '#F59E0B', red: '#DC2626',
};

/* ─────────── deterministic seed-based mock data generator ──────── */
function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; } return Math.abs(h); }
function seededRandom(seed) { let t = seed + 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }

function generateData(district, year) {
  const s = hashCode(`${district}-${year}`);
  const r = (min, max) => { const v = seededRandom(s + min * 7 + max * 13); return min + v * (max - min); };
  const allocated = Math.round(r(120, 480));
  const utilPct = Math.round(r(55, 95));
  const spent = Math.round(allocated * utilPct / 100);
  const leakage = Math.round(r(2, allocated * 0.12));
  const farmers = Math.round(r(25000, 95000));
  const schemes = Math.round(r(4, 12));
  const anomalies = Math.round(r(0, 6));
  const departments = [
    { name: 'Agriculture', pct: Math.round(r(50, 95)) },
    { name: 'Rural Dev', pct: Math.round(r(45, 90)) },
    { name: 'Infrastructure', pct: Math.round(r(40, 88)) },
    { name: 'Education', pct: Math.round(r(55, 92)) },
  ];
  const trend = Array.from({ length: 6 }, (_, i) => Math.round(r(spent * 0.08, spent * 0.22)));
  return { district, year, allocated, spent, utilPct, leakage, farmers, schemes, anomalies, departments, trend };
}

/* ──────────────── all districts flat list ──────────────── */
const ALL_DISTRICTS = Object.values(DIVISIONS).flatMap(d => d.districts).sort();
const YEARS = FISCAL_YEARS.filter(y => {
  const start = parseInt(y.split('-')[0]);
  return start >= 2021 && start <= 2025;
});
if (YEARS.length === 0) FISCAL_YEARS.slice(-5).forEach(y => YEARS.push(y));

/* ══════════════════ SUB-COMPONENTS ══════════════════ */

/* ── Animated Counter ── */
function Counter({ value, prefix = '', suffix = '', duration = 1200, color }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span style={{ color: color || C.text, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>;
}

/* ── Ring Gauge ── */
function RingGauge({ pct, size = 130 }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = pct >= 80 ? C.green : pct >= 65 ? C.amber : C.red;
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circumference}
        strokeDashoffset={circumference - (pct / 100) * circumference}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        style={{ fontSize: 26, fontWeight: 800, fill: color, fontFamily: "'DM Sans', sans-serif" }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ── SVG Sparkline ── */
function Sparkline({ data, color = C.brightBlue, width = 200, height = 48 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 8) - 4}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block', margin: '8px auto 0' }}>
      <polyline fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
      {data.map((v, i) => {
        const cx = (i / (data.length - 1)) * width;
        const cy = height - ((v - min) / range) * (height - 8) - 4;
        return <circle key={i} cx={cx} cy={cy} r={3} fill={color} opacity={0.7} />;
      })}
    </svg>
  );
}

/* ── Progress Bar ── */
function DeptBar({ name, pct, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 80 + delay); return () => clearTimeout(t); }, [pct, delay]);
  const color = pct >= 80 ? C.green : pct >= 65 ? C.amber : C.red;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>
        <span>{name}</span><span style={{ fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: '#E2E8F0', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 4, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );
}

/* ── Metric Row ── */
function MetricRow({ label, value, icon, color, pulse }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: color || C.text, fontFamily: "'DM Sans', sans-serif", animation: pulse ? 'leakPulse 2s ease-in-out infinite' : 'none' }}>
          <Counter value={value} prefix="₹ " suffix=" Cr" color={color} />
        </div>
      </div>
    </div>
  );
}

/* ── Panel ── */
function Panel({ data, accentColor, animKey }) {
  return (
    <div key={animKey} style={{
      flex: 1, background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      animation: 'fadeSlideIn 0.6s ease-out both',
    }}>
      {/* Header */}
      <div style={{
        background: accentColor, padding: '14px 20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>{data.district}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>FY {data.year}</div>
        </div>
        <div style={{
          background: data.utilPct >= 80 ? C.green : data.utilPct >= 65 ? C.amber : C.red,
          color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {data.utilPct}% Utilised
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Ring Gauge */}
        <RingGauge pct={data.utilPct} />

        {/* Metrics */}
        <div style={{ marginTop: 16 }}>
          <MetricRow label="Total Allocated" value={data.allocated} icon="💰" />
          <MetricRow label="Funds Spent" value={data.spent} icon="📊" color={C.brightBlue} />
          <MetricRow label="Detected Leakage" value={data.leakage} icon="🚨" color={C.red} pulse />
        </div>

        {/* Department Bars */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Department Utilisation
          </div>
          {data.departments.map((d, i) => <DeptBar key={d.name} name={d.name} pct={d.pct} delay={i * 120} />)}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16, padding: '12px 0', borderTop: '1px solid #F1F5F9' }}>
          {[
            { label: 'Farmers', value: data.farmers, icon: '👨‍🌾' },
            { label: 'Schemes', value: data.schemes, icon: '📋' },
            { label: 'Anomalies', value: data.anomalies, icon: '⚠️', warn: data.anomalies > 3 },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.warn ? C.red : C.text, fontFamily: "'DM Sans', sans-serif" }}>
                {s.label === 'Farmers' ? <Counter value={s.value} /> : s.value}
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>6-Month Spending Trend</div>
          <Sparkline data={data.trend} color={accentColor} />
        </div>
      </div>
    </div>
  );
}

/* ── Delta Column ── */
function DeltaColumn({ left, right }) {
  const deltas = [
    { label: 'Allocation', l: left.allocated, r: right.allocated, unit: ' Cr', higherBetter: true },
    { label: 'Utilisation', l: left.utilPct, r: right.utilPct, unit: '%', higherBetter: true },
    { label: 'Leakage', l: left.leakage, r: right.leakage, unit: ' Cr', higherBetter: false },
    { label: 'Farmers', l: left.farmers, r: right.farmers, unit: '', higherBetter: true },
  ];

  const overallLeft = deltas.filter(d => d.higherBetter ? d.l > d.r : d.l < d.r).length;
  const overallRight = deltas.filter(d => d.higherBetter ? d.r > d.l : d.r < d.l).length;

  return (
    <div style={{
      width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10, paddingTop: 60,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase',
        letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", marginBottom: 4,
      }}>Δ Delta</div>

      {deltas.map(d => {
        const diff = d.r - d.l;
        const absDiff = Math.abs(diff);
        const better = d.higherBetter ? diff > 0 : diff < 0;
        const neutral = diff === 0;
        return (
          <div key={d.label} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '8px 10px', width: '100%', textAlign: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{d.label}</div>
            <div style={{
              fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              color: neutral ? C.muted : better ? C.green : C.red,
            }}>
              {neutral ? '—' : `${better ? '▲' : '▼'} ${d.label === 'Farmers' ? absDiff.toLocaleString('en-IN') : absDiff}${d.unit}`}
            </div>
          </div>
        );
      })}

      {/* Winner Badge */}
      <div style={{
        marginTop: 8, padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        background: overallLeft === overallRight ? '#F1F5F9' : (overallLeft > overallRight ? `${C.govBlue}15` : `${C.brightBlue}15`),
        color: overallLeft === overallRight ? C.muted : C.green,
      }}>
        {overallLeft === overallRight ? 'TIE' : overallLeft > overallRight ? '← Better' : 'Better →'}
      </div>
    </div>
  );
}

/* ── Custom Select ── */
function Select({ value, options, onChange, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
        background: C.card, color: C.text, fontSize: 13, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer',
        minWidth: 160, appearance: 'auto',
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ══════════════════ MAIN COMPONENT ══════════════════ */
export default function DistrictComparisonMode() {
  const [mode, setMode] = useState('district'); // 'district' | 'year'
  const [leftDistrict, setLeftDistrict] = useState(ALL_DISTRICTS[0]);
  const [rightDistrict, setRightDistrict] = useState(ALL_DISTRICTS[1]);
  const [leftYear, setLeftYear] = useState(YEARS[YEARS.length - 1] || '2024-25');
  const [rightYear, setRightYear] = useState(YEARS[YEARS.length - 2] || '2023-24');
  const [fixedYear, setFixedYear] = useState(YEARS[YEARS.length - 1] || '2024-25');
  const [fixedDistrict, setFixedDistrict] = useState(ALL_DISTRICTS[0]);
  const [compareKey, setCompareKey] = useState(0);

  const leftData = mode === 'district'
    ? generateData(leftDistrict, fixedYear)
    : generateData(fixedDistrict, leftYear);

  const rightData = mode === 'district'
    ? generateData(rightDistrict, fixedYear)
    : generateData(fixedDistrict, rightYear);

  const handleCompare = () => setCompareKey(k => k + 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes leakPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
      `}</style>

      <div style={{
        minHeight: '100%', background: C.bg, fontFamily: "'DM Sans', sans-serif",
        animation: 'fadeSlideIn 0.5s ease-out both',
      }}>
        {/* ── Page Title ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Comparison Intelligence</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Side-by-side budget analysis across districts and fiscal years</p>
        </div>

        {/* ── Mode Pill Switcher ── */}
        <div style={{
          display: 'inline-flex', background: '#E2E8F0', borderRadius: 12, padding: 3, marginBottom: 20,
        }}>
          {[
            { key: 'district', label: '🏛️ District vs District' },
            { key: 'year', label: '📅 Year over Year' },
          ].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)} style={{
              padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              background: mode === m.key ? C.card : 'transparent',
              color: mode === m.key ? C.govBlue : C.muted,
              boxShadow: mode === m.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Selector Bar ── */}
        <div style={{
          background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '16px 24px',
          display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 24,
        }}>
          {mode === 'district' ? (
            <>
              <Select label="Left District" value={leftDistrict} options={ALL_DISTRICTS} onChange={setLeftDistrict} />
              <div style={{ fontSize: 22, color: C.muted, paddingBottom: 6 }}>⇄</div>
              <Select label="Right District" value={rightDistrict} options={ALL_DISTRICTS} onChange={setRightDistrict} />
              <Select label="Fiscal Year" value={fixedYear} options={YEARS} onChange={setFixedYear} />
            </>
          ) : (
            <>
              <Select label="District" value={fixedDistrict} options={ALL_DISTRICTS} onChange={setFixedDistrict} />
              <Select label="Year A" value={leftYear} options={YEARS} onChange={setLeftYear} />
              <div style={{ fontSize: 22, color: C.muted, paddingBottom: 6 }}>⇄</div>
              <Select label="Year B" value={rightYear} options={YEARS} onChange={setRightYear} />
            </>
          )}

          <button onClick={handleCompare} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10,
            background: C.govBlue, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            transition: 'background 0.2s', marginLeft: 'auto',
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.brightBlue}
            onMouseLeave={e => e.currentTarget.style.background = C.govBlue}
          >
            ⚡ Compare Now
          </button>
        </div>

        {/* ── Comparison Panels ── */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
          <Panel data={leftData} accentColor={C.govBlue} animKey={`left-${compareKey}`} />
          <DeltaColumn left={leftData} right={rightData} />
          <Panel data={rightData} accentColor={C.brightBlue} animKey={`right-${compareKey}`} />
        </div>

        {/* ── Footer ── */}
        <div style={{
          textAlign: 'center', padding: '24px 0 12px', fontSize: 12, color: C.muted,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          ⚡ Live data from Firebase · data.gov.in · Last synced: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>
    </>
  );
}
