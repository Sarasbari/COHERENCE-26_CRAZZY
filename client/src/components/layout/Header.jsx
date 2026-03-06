import { Bell, ChevronDown, Download, User, Check } from 'lucide-react';
import { useFilterContext } from '../../context/FilterContext';
import { useState, useRef, useEffect } from 'react';
import { DIVISIONS } from '../../config/constants';

// Custom Dropdown Component
function Dropdown({ value, options, onChange, placeholder, minWidth = "140px" }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition-colors focus:outline-none justify-between cursor-pointer"
                style={{ minWidth }}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown size={14} className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-white border border-[#E2E8F0] shadow-xl rounded-lg py-1 z-50 max-h-64 overflow-y-auto">
                    <button
                        onClick={() => {
                            onChange(null);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-between text-[#334155]"
                    >
                        <span>{placeholder}</span>
                        {!value && <Check size={14} className="text-[#3B82F6]" />}
                    </button>

                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-between ${value === opt.value ? 'text-[#0F172A] font-medium' : 'text-[#334155]'
                                }`}
                        >
                            <span>{opt.label}</span>
                            {value === opt.value && <Check size={14} className="text-[#3B82F6]" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Header() {

    const { filters, updateFilter, meta } = useFilterContext();

    const years = meta?.fiscalYears || [];

    const yearOptions = years.map(y => ({
        value: y,
        label: y.startsWith('All') ? y : `FY ${y}`
    }));

    const allDistricts = Object.values(DIVISIONS)
        .flatMap(div => div.districts)
        .sort((a, b) => a.localeCompare(b));

    const districtOptions = allDistricts.map(d => ({ value: d, label: d }));

    const handleExport = () => {
        const csvContent =
            "data:text/csv;charset=utf-8,District,Allocated (Cr),Utilization (%),Flagged Amt (Cr),Risk Level\nPune,45.2,78,0.12,Low\nNagpur,32.15,42,0.84,High\nMumbai City,85.0,65,0.32,Medium\nAurangabad,39.4,39,0.039,High";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");

        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "district_performance.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <header className="h-16 bg-[#1E3A8A] border-b border-[#1E3A8A] flex items-center justify-between px-6 sticky top-0 z-30">

            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-xs text-white font-medium">Live Sync</span>
                </div>
            </div>

            <div className="flex items-center gap-3">

                <Dropdown
                    value={filters.district}
                    options={districtOptions}
                    onChange={(val) => updateFilter('district', val)}
                    placeholder="All Districts"
                />

                <Dropdown
                    value={filters.fiscalYear}
                    options={yearOptions}
                    onChange={(val) => updateFilter('fiscalYear', val)}
                    placeholder="All Years"
                />

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Download size={14} />
                    Export Data
                </button>

                <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Bell size={18} className="text-white/80" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full" />
                </button>

                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={16} className="text-white" />
                </div>

            </div>
        </header>
    );
}
