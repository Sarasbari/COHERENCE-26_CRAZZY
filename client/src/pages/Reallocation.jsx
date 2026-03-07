import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ArrowRight, TrendingUp, AlertTriangle, Scale, ShieldAlert, CheckCircle2, Wand2, Sparkles, Users, FileText } from 'lucide-react';
import { useFilterContext } from '../context/FilterContext';
import { getReallocationCandidates } from '../services/analyticsEngine';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';

export default function Reallocation() {
    const { filteredData, loading } = useFilterContext();
    const { user } = useAuth();
    const contentRef = useRef(null);

    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');
    const [transferAmount, setTransferAmount] = useState(0);
    const [simulated, setSimulated] = useState(false);

    // Audit Log state
    const [auditLog, setAuditLog] = useState([]);

    const candidates = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return { sources: [], targets: [] };
        return getReallocationCandidates(filteredData);
    }, [filteredData]);

    const selectedSource = candidates.sources.find(s => s.id === sourceId);
    const selectedTarget = candidates.targets.find(t => t.id === targetId);

    const maxTransfer = selectedSource ? Number((selectedSource.availableAmount / 10000000).toFixed(2)) : 0; // Convert to Cr for display logic

    const handleAutoOptimize = () => {
        if (!selectedSource) return;

        // Intelligence Layer Logic: Transfer 70% of Idle Capital
        const optimalTransferCr = Number((maxTransfer * 0.7).toFixed(2));

        setTransferAmount(optimalTransferCr);
        // Reset simulation view if active
        setSimulated(false);
    };

    const handleRunSimulation = () => {
        setSimulated(true);
    };

    const handleAutoExecute = () => {
        if (!selectedSource || !selectedTarget || transferAmount <= 0) return;

        const newLogEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            officer: user ? user.displayName || user.email : 'System Authorized',
            sourceStr: `${selectedSource.department} (${selectedSource.district})`,
            targetStr: `${selectedTarget.department} (${selectedTarget.district})`,
            amount: transferAmount,
            utilizationDelta: `+${Math.abs(impact.targetRelief).toFixed(1)}%`,
            status: 'Executed & Logged'
        };

        setAuditLog(prev => [newLogEntry, ...prev]);
        setSimulated(false);
        setSourceId('');
        setTargetId('');
        setTransferAmount(0);
    };

    const handleExport = () => {
        if (!user) {
            alert("Please sign in to export formal reallocation proposals.");
            return;
        }
        if (!selectedSource || !selectedTarget || transferAmount <= 0 || !simulated) {
            alert("Please run a valid simulation to generate a proposal.");
            return;
        }

        const element = contentRef.current;
        const opt = {
            margin: 10,
            filename: `Reallocation-Proposal-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const impactCalculations = () => {
        if (!selectedSource || !selectedTarget || transferAmount === 0 || !simulated) return null;

        // Convert input Cr back to raw value spacing for calculation
        const transferRaw = transferAmount * 10000000;

        const newSourceAlloc = selectedSource.allocated - transferRaw;
        const newSourceUtil = newSourceAlloc > 0 ? (selectedSource.spent / newSourceAlloc) * 100 : 0;

        const newTargetAlloc = selectedTarget.allocated + transferRaw;
        const newTargetUtil = newTargetAlloc > 0 ? (selectedTarget.spent / newTargetAlloc) * 100 : 0;

        // Sector Multipliers
        const sectorMultipliers = {
            'Public Health': 2400,
            'Education': 1800,
            'PWD': 900,
            'Agriculture': 1200
        };

        // Determine multiplier (fallback to 1000 if not standard)
        let multiplier = 1000;
        Object.keys(sectorMultipliers).forEach(sector => {
            if (selectedTarget.department.includes(sector)) {
                multiplier = sectorMultipliers[sector];
            }
        });

        const citizensImpacted = transferAmount * multiplier;

        // Risk Score
        const sourceRiskRedux = Math.floor(Math.abs(newSourceUtil - selectedSource.utilization) * 0.4);
        const targetRiskRedux = Math.floor(Math.abs(selectedTarget.utilization - newTargetUtil) * 0.4) + 8; // Assumes < 60 days left for target simulation bonus

        return {
            sourceImprovement: newSourceUtil - selectedSource.utilization,
            targetRelief: selectedTarget.utilization - newTargetUtil,
            newSourceUtil,
            newTargetUtil,
            citizensImpacted,
            sourceRiskRedux,
            targetRiskRedux
        };
    };

    const impact = impactCalculations();

    // Mock Chips
    const suggestedChips = [
        { id: 1, source: "Public Health (Gadchiroli)", target: "Public Health (Akola)", sourceUtil: 52, targetUtil: 81, amount: 12.4, tag: "Lapse Risk", tagColor: "bg-red-100 text-red-700 border-red-200" },
        { id: 2, source: "School Education (Washim)", target: "School Education (Nandurbar)", sourceUtil: 48, targetUtil: 79, amount: 8.1, tag: "Under-utilized", tagColor: "bg-amber-100 text-amber-700 border-amber-200" },
        { id: 3, source: "Public Works (Hingoli)", target: "Public Works (Palghar)", sourceUtil: 55, targetUtil: 83, amount: 6.7, tag: "Lapse Risk", tagColor: "bg-red-100 text-red-700 border-red-200" }
    ];

    const handleApplyChip = (chip) => {
        // Find best match in real data to bind to standard dropdowns, fallback to mock if real data not present for demo
        const sMatch = candidates.sources.find(s => s.label.includes(chip.source.split(' (')[0]));
        const tMatch = candidates.targets.find(t => t.label.includes(chip.target.split(' (')[0]));

        if (sMatch && tMatch) {
            setSourceId(sMatch.id);
            setTargetId(tMatch.id);
            setTransferAmount(Math.min(chip.amount, Number((sMatch.availableAmount / 10000000).toFixed(2))));
            setSimulated(false);
        } else if (candidates.sources.length > 0 && candidates.targets.length > 0) {
            setSourceId(candidates.sources[0].id);
            setTargetId(candidates.targets[0].id);
            setTransferAmount(Math.min(chip.amount, Number((candidates.sources[0].availableAmount / 10000000).toFixed(2))));
            setSimulated(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-1">Smart Fund Reallocation</h2>
                    <p className="text-[#64748B] text-xs md:text-sm">Mathematically offset imminent fund lapses into active high-yield deficit sectors.</p>
                </motion.div>

                <button
                    onClick={handleExport}
                    disabled={!simulated}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm ${simulated ? 'bg-[#1E3A8A] text-white hover:bg-[#1e3a8a]/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                    <Download size={16} />
                    Export Proposal (PDF)
                </button>
            </div>

            {/* Section 1: AI Suggestions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Banner */}
                <div className="bg-[#fff8e1] border-l-4 border-[#f97316] p-4 rounded-r-lg shadow-sm flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Sparkles className="text-[#f97316] mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-bold text-[#b45309]">AI detected 4 reallocation opportunities this quarter</h3>
                            <p className="text-xs text-[#d97706] mt-1">Based on utilization &lt; 60% and year-end lapse risk across 36 Maharashtra districts</p>
                        </div>
                    </div>
                    <button className="text-xs font-semibold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1">
                        View All Suggestions <ArrowRight size={14} />
                    </button>
                </div>

                {/* Chips */}
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                    {suggestedChips.map(chip => (
                        <div key={chip.id} className="min-w-[320px] bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm snap-start shrink-0 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${chip.tagColor}`}>
                                        {chip.tag === "Lapse Risk" ? "⚠" : "📉"} {chip.tag}
                                    </span>
                                    <span className="text-sm font-bold text-[#0F172A]">₹{chip.amount} Cr</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-[#475569] mb-4">
                                    <span className="truncate max-w-[120px]" title={chip.source}>{chip.source}</span>
                                    <ArrowRight size={14} className="text-[#94A3B8] shrink-0" />
                                    <span className="truncate max-w-[120px]" title={chip.target}>{chip.target}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleApplyChip(chip)}
                                className="w-full text-xs font-semibold bg-gray-50 hover:bg-[#fff8e1] hover:text-[#f97316] text-[#64748B] py-2 rounded-lg border border-gray-200 transition-colors"
                            >
                                Apply to Sandbox
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={contentRef}>
                {/* Section 2: Transfer Sandbox */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card flex flex-col"
                >
                    <div className="p-6 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                                <Scale className="text-[#1E3A8A]" size={20} />
                                Transfer Sandbox
                            </h3>
                            <button
                                onClick={handleAutoOptimize}
                                disabled={!selectedSource}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-sm ${selectedSource ? 'bg-[#fff8e1] text-[#f97316] hover:bg-[#ffedd5] border-[#fde68a]' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                            >
                                <Wand2 size={14} />
                                AI Optimize
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Source Selection */}
                            <div>
                                <label className="block text-sm font-medium text-[#475569] mb-1.5 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-[#EF4444]" />
                                    Idle Source (Under-utilized)
                                </label>
                                <select
                                    value={sourceId}
                                    onChange={(e) => {
                                        setSourceId(e.target.value);
                                        setTransferAmount(0);
                                        setSimulated(false);
                                    }}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] outline-none"
                                >
                                    <option value="">Select a hemorrhaging department...</option>
                                    {candidates.sources.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                                {selectedSource && (
                                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-[#64748B] mt-1.5 ml-1">
                                        Current Idle Capital: <span className="font-semibold text-[#EF4444]">₹{maxTransfer} Cr</span> (Utilization: {selectedSource.utilization.toFixed(1)}%)
                                    </motion.p>
                                )}
                            </div>

                            {/* Visual Arrow */}
                            <div className="flex justify-center -my-2 relative z-10">
                                <div className="bg-white p-2 rounded-full border border-[#E2E8F0] shadow-sm">
                                    <ArrowRight size={18} className="text-[#94A3B8] transform rotate-90 lg:rotate-0" />
                                </div>
                            </div>

                            {/* Target Selection */}
                            <div>
                                <label className="block text-sm font-medium text-[#475569] mb-1.5 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-[#10B981]" />
                                    Deficit Target (High Need)
                                </label>
                                <select
                                    value={targetId}
                                    onChange={(e) => {
                                        setTargetId(e.target.value);
                                        setSimulated(false);
                                    }}
                                    className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${selectedTarget ? 'border-[#10B981] ring-1 ring-[#10B981]' : 'border-[#E2E8F0] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]'}`}
                                >
                                    <option value="">Select a high-performing department...</option>
                                    {candidates.targets.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                                {selectedTarget && (
                                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-[#64748B] mt-1.5 ml-1">
                                        Current Utilization: <span className="font-semibold text-[#10B981]">{selectedTarget.utilization.toFixed(1)}%</span> (Highly Starved)
                                    </motion.p>
                                )}
                            </div>

                            {/* Amount Slider */}
                            {selectedSource && selectedTarget && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-[#E2E8F0]">
                                    <label className="block text-sm font-medium text-[#475569] mb-3">
                                        Proposal Transfer Amount (₹ Crores)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max={maxTransfer}
                                            step="0.1"
                                            value={transferAmount}
                                            onChange={(e) => {
                                                setTransferAmount(Number(e.target.value));
                                                setSimulated(false);
                                            }}
                                            className="flex-1 h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#f97316]"
                                        />
                                        <div className="w-24 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">₹</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={transferAmount}
                                                onChange={(e) => {
                                                    setTransferAmount(Math.min(maxTransfer, Math.max(0, Number(e.target.value))));
                                                    setSimulated(false);
                                                }}
                                                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-7 pr-3 py-2 text-sm font-semibold focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] outline-none"
                                                max={maxTransfer}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className="font-medium text-[#f97316]">₹{transferAmount} Cr selected</span>
                                        <span className="text-[#94A3B8]">Max transfer limit: ₹{maxTransfer} Cr</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Run Simulation CTA */}
                    <div className="p-4 border-t border-[#E2E8F0] bg-gray-50/50 rounded-b-xl">
                        <button
                            onClick={handleRunSimulation}
                            disabled={!selectedSource || !selectedTarget || transferAmount <= 0}
                            className={`w-full py-3 rounded-lg text-sm font-bold shadow-sm transition-all ${(!selectedSource || !selectedTarget || transferAmount <= 0) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#f97316] text-white hover:bg-[#ea580c]'}`}
                        >
                            Run Simulation
                        </button>
                    </div>
                </motion.div>

                {/* Section 3: Impact Preview Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card flex flex-col overflow-hidden"
                >
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Simulation Impact</h3>

                        <AnimatePresence mode="wait">
                            {!simulated ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]"
                                >
                                    <ShieldAlert size={48} className="text-[#CBD5E1] mb-4" />
                                    <p className="text-[#64748B] font-medium">No Simulation Active</p>
                                    <p className="text-[#94A3B8] text-sm mt-1">Select a source, target, and amount to preview the macro-economic impact.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="impact"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6 flex-1 flex flex-col justify-between"
                                >
                                    {/* 3a: Utilization Shift */}
                                    <div className="flex gap-4">
                                        {/* Source Box */}
                                        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                                            <h4 className="text-xs font-semibold text-[#64748B] mb-3 truncate" title={selectedSource.department}>{selectedSource.department} ({selectedSource.district})</h4>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-[10px] uppercase font-bold text-[#94A3B8] mb-1">
                                                        <span>Before</span>
                                                        <span>{selectedSource.utilization.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-[#F1F5F9]">
                                                        <div className="h-full bg-[#EF4444] rounded-full" style={{ width: `${Math.min(100, selectedSource.utilization)}%` }} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[10px] uppercase font-bold text-[#b45309] mb-1">
                                                        <span>After</span>
                                                        <span>{impact.newSourceUtil.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-[#F1F5F9]">
                                                        <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${Math.min(100, impact.newSourceUtil)}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-[11px] font-semibold text-white bg-[#f97316] inline-block px-2 py-0.5 rounded">
                                                ↓ Freed ₹{transferAmount} Cr
                                            </div>
                                        </div>

                                        {/* Target Box */}
                                        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
                                            <h4 className="text-xs font-semibold text-[#64748B] mb-3 truncate" title={selectedTarget.department}>{selectedTarget.department} ({selectedTarget.district})</h4>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-[10px] uppercase font-bold text-[#94A3B8] mb-1">
                                                        <span>Before</span>
                                                        <span>{selectedTarget.utilization.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-[#F1F5F9]">
                                                        <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${Math.min(100, selectedTarget.utilization)}%` }} />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[10px] uppercase font-bold text-[#059669] mb-1">
                                                        <span>After</span>
                                                        <span>{impact.newTargetUtil.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-[#F1F5F9]">
                                                        <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, impact.newTargetUtil)}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-[11px] font-semibold text-white bg-[#10B981] inline-block px-2 py-0.5 rounded">
                                                ↑ Boosted by ₹{transferAmount} Cr
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3b: Citizens Impacted */}
                                    <div className="flex items-center gap-4 bg-[#fff8e1] border border-[#fde68a] rounded-xl p-4">
                                        <div className="h-10 w-10 bg-[#fef3c7] rounded-full border border-[#fcd34d] flex items-center justify-center shrink-0">
                                            <Users size={20} className="text-[#f97316]" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-[#b45309]">~{impact.citizensImpacted.toLocaleString()} citizens</h4>
                                            <p className="text-xs text-[#d97706] font-medium leading-tight mt-0.5">
                                                in {selectedTarget.district} gain improved {selectedTarget.department} coverage
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3c: Risk Score Delta */}
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                                            <span className="text-[10px] uppercase font-bold text-[#64748B]">Source Risk</span>
                                            <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F172A]">
                                                {67} <ArrowRight size={12} className="text-[#94A3B8]" /> <span className="text-[#10B981] flex items-center">{67 - impact.sourceRiskRedux} <TrendingUp size={12} className="ml-1 rotate-180" /></span>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                                            <span className="text-[10px] uppercase font-bold text-[#64748B]">Target Risk</span>
                                            <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F172A]">
                                                {78} <ArrowRight size={12} className="text-[#94A3B8]" /> <span className="text-[#10B981] flex items-center">{78 - impact.targetRiskRedux} <TrendingUp size={12} className="ml-1 rotate-180" /></span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3d: Auto-Execute CTA */}
                    <AnimatePresence>
                        {simulated && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                                <div className="bg-[#ecfdf5] border-t border-[#a7f3d0] p-3 text-center">
                                    <p className="text-xs font-semibold text-[#059669] flex items-center justify-center gap-1.5">
                                        <CheckCircle2 size={14} /> This transfer will auto-execute upon confirmation
                                    </p>
                                </div>
                                <button
                                    onClick={handleAutoExecute}
                                    className="w-full bg-[#10B981] text-white font-bold py-3.5 hover:bg-[#059669] transition-colors"
                                >
                                    Confirm & Execute
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Audit Log Table */}
            {auditLog.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E2E8F0] bg-white">
                        <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <FileText size={18} className="text-[#475569]" /> Execution Audit Log
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Officer</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3">Target</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Utilization Δ</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] bg-white text-[#334155]">
                                {auditLog.map(log => (
                                    <tr key={log.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                                        <td className="px-6 py-3.5 text-[#64748B] text-xs">{log.timestamp}</td>
                                        <td className="px-6 py-3.5 font-medium text-[#0F172A]">{log.officer}</td>
                                        <td className="px-6 py-3.5">{log.sourceStr}</td>
                                        <td className="px-6 py-3.5">{log.targetStr}</td>
                                        <td className="px-6 py-3.5 font-bold text-[#F59E0B]">₹{log.amount} Cr</td>
                                        <td className="px-6 py-3.5 text-[#10B981] font-semibold">{log.utilizationDelta}</td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center gap-1 bg-[#ecfdf5] text-[#059669] px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-[#a7f3d0]">
                                                <CheckCircle2 size={10} /> {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}
