import { useState, useEffect, useRef, useMemo } from 'react';
import { DIVISIONS, FISCAL_YEARS } from '../config/constants';
import { useFilterContext } from '../context/FilterContext';

/* ───────────────────────── colour tokens ───────────────────────── */
const C = {
  govBlue: '#1E3A8A', brightBlue: '#3B82F6', bg: '#F8FAFC',
  card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', muted: '#64748B',
  green: '#16A34A', amber: '#F59E0B', red: '#DC2626',
};

/* ──────────────── logic to aggregate from firebase ──────────────── */
function aggregateDistrictData(allData, district, year) {
  const defaultData = { district, year, allocated: 0, spent: 0, utilPct: 0, leakage: 0, farmers: 0, schemes: 0, anomalies: 0, departments: [], trend: [0, 0, 0, 0, 0, 0] };

  if (!allData || allData.length === 0) return defaultData;

  // Find all records for this district across years
  const distNameLower = district.toLowerCase();
  const districtRecords = allData.filter(d => (d.district || '').toLowerCase() === distNameLower);

  // Find current year records
  const records = districtRecords.filter(d => d.fiscalYear === year);

  if (records.length === 0) return defaultData;

  let allocated = 0;
  let spent = 0;
  let anomalies = 0;
  let farmers = 0;
  const deptMap = {};

  records.forEach(r => {
    allocated += (Number(r.allocated) || 0);
    spent += (Number(r.spent) || 0);
    if (r.hasAnomaly) anomalies += 1;

    // specific field extraction for farmers from raw JSON
    if (r._raw && (r._raw.farmer_count || r._raw.Farmer_Count)) {
      farmers += Number(r._raw.farmer_count || r._raw.Farmer_Count) || 0;
    }

    const deptName = r.departmentName || 'General';
    if (!deptMap[deptName]) {
      deptMap[deptName] = { allocated: 0, spent: 0 };
    }
    deptMap[deptName].allocated += (Number(r.allocated) || 0);
    deptMap[deptName].spent += (Number(r.spent) || 0);
  });

  // Calculate percentages
  const utilPct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  // Calculate leakage: simply unspent funds for visual impact here or based on anomalies. 
  // Let's use unspent allocation as basic leakage proxy if anomaly is present, otherwise a fraction.
  const leakage = allocated - spent;

  const departments = Object.keys(deptMap).map(k => ({
    name: k,
    pct: deptMap[k].allocated > 0 ? Math.round((deptMap[k].spent / deptMap[k].allocated) * 100) : 0
  }));

  // Create historical trend from past 6 years
  const sortedYears = [...new Set(districtRecords.map(d => d.fiscalYear).filter(Boolean))].sort();
  const trend = [];
  const targetIdx = sortedYears.indexOf(year);

  if (targetIdx !== -1) {
    for (let i = Math.max(0, targetIdx - 5); i <= targetIdx; i++) {
      const y = sortedYears[i];
      const yRecs = districtRecords.filter(d => d.fiscalYear === y);
      const ySpent = yRecs.reduce((sum, r) => sum + (Number(r.spent) || 0), 0);
      trend.push(ySpent);
    }
  } else {
    trend.push(spent);
  }

  // Pad if < 6 points to maintain sparkline shape
  while (trend.length < 6) trend.unshift(trend[0] || 0);

  return {
    district,
    year,
    allocated: Math.round(allocated),
    spent: Math.round(spent),
    utilPct,
    leakage: Math.max(0, Math.round(leakage)),
    farmers,
    schemes: records.length,
    anomalies,
    departments,
    trend
  };
}

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
        strokeDashoffset={circumference - (isNaN(pct) ? 0 : pct / 100) * circumference}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        style={{ fontSize: 26, fontWeight: 800, fill: color, fontFamily: "'DM Sans', sans-serif" }}>
        {pct || 0}%
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
        <span className="truncate max-w-[140px]">{name}</span><span style={{ fontWeight: 600, color }}>{pct}%</span>
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
          {data.utilPct || 0}% Utilised
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Ring Gauge */}
        <RingGauge pct={data.utilPct} />

        {/* Metrics */}
        <div style={{ marginTop: 16 }}>
          <MetricRow label="Total Allocated" value={data.allocated} icon="💰" />
          <MetricRow label="Funds Spent" value={data.spent} icon="📊" color={C.brightBlue} />
          <MetricRow label="Unspent/Leakage" value={data.leakage} icon="🚨" color={C.red} pulse={data.leakage > 0} />
        </div>

        {/* Department Bars */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Department Utilisation
          </div>
          {data.departments.map((d, i) => <DeptBar key={d.name} name={d.name} pct={d.pct} delay={i * 120} />)}
          {data.departments.length === 0 && <span className="text-xs text-gray-400">No departments found</span>}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-around', marginTop: 16, padding: '12px 0', borderTop: '1px solid #F1F5F9' }}>
          {[
            { label: 'Farmers', value: data.farmers, icon: '👨‍🌾' },
            { label: 'Schemes', value: data.schemes, icon: '📋' },
            { label: 'Anomalies', value: data.anomalies, icon: '⚠️', warn: data.anomalies > 0 },
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
          <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Historical Spending Trend</div>
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
    { label: 'Unspent/Leakage', l: left.leakage, r: right.leakage, unit: ' Cr', higherBetter: false },
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
  const { allData, meta } = useFilterContext();
  const [mode, setMode] = useState('district'); // 'district' | 'year'

  // Extract districts and years from real meta, fallback to constants
  const ALL_DISTRICTS = useMemo(() => {
    return meta?.divisions?.flatMap(div => DIVISIONS[div]?.districts || [])?.sort() || Object.values(DIVISIONS).flatMap(d => d.districts).sort();
  }, [meta]);

  const YEARS = useMemo(() => {
    return meta?.fiscalYears?.filter(y => !y.includes('All'))?.sort() || FISCAL_YEARS;
  }, [meta]);

  const [leftDistrict, setLeftDistrict] = useState(ALL_DISTRICTS[0] || 'Nagpur');
  const [rightDistrict, setRightDistrict] = useState(ALL_DISTRICTS[1] || 'Amravati');
  const [leftYear, setLeftYear] = useState(YEARS[YEARS.length - 1] || '2024-25');
  const [rightYear, setRightYear] = useState(YEARS[YEARS.length - 2] || '2023-24');
  const [fixedYear, setFixedYear] = useState(YEARS[YEARS.length - 1] || '2024-25');
  const [fixedDistrict, setFixedDistrict] = useState(ALL_DISTRICTS[0] || 'Nagpur');
  const [compareKey, setCompareKey] = useState(0);

  // Sync state if YEARS/DISTRICTS load async
  useEffect(() => {
    if (YEARS?.length > 0 && !YEARS.includes(leftYear)) {
      setLeftYear(YEARS[YEARS.length - 1]);
      setRightYear(YEARS[Math.max(0, YEARS.length - 2)]);
      setFixedYear(YEARS[YEARS.length - 1]);
    }
  }, [YEARS]);

  const leftData = useMemo(() => {
    return mode === 'district'
      ? aggregateDistrictData(allData, leftDistrict, fixedYear)
      : aggregateDistrictData(allData, fixedDistrict, leftYear);
  }, [mode, allData, leftDistrict, fixedDistrict, fixedYear, leftYear, compareKey]);

  const rightData = useMemo(() => {
    return mode === 'district'
      ? aggregateDistrictData(allData, rightDistrict, fixedYear)
      : aggregateDistrictData(allData, fixedDistrict, rightYear);
  }, [mode, allData, rightDistrict, fixedDistrict, fixedYear, rightYear, compareKey]);

  const handleCompare = () => setCompareKey(k => k + 1);

  if (!allData || allData.length === 0) {
    return <div className="flex h-full w-full items-center justify-center text-gray-500">Loading Intelligence Data...</div>;
  }

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
        paddingBottom: '20px'
      }}>
        {/* ── Page Title ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Comparison Intelligence</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Side-by-side budget analysis across districts and fiscal years using Firebase data</p>
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
          ⚡ Live data from Firebase ({allData.length} records) · Last synced: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>
    </>
  );
}
