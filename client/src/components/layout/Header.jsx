import { Bell, ChevronDown, Download, User, Check, FileText } from 'lucide-react';
import { useFilterContext } from '../../context/FilterContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { DIVISIONS } from '../../config/constants';
import { useNavigate } from 'react-router-dom';

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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition-colors focus:outline-none justify-between cursor-pointer`}
                style={{ minWidth }}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown size={14} className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-56 bg-white border border-[#E2E8F0] shadow-xl rounded-lg py-1 z-50 max-h-64 overflow-y-auto">
                    {/* Placeholder option (e.g. All Years) */}
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
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-between ${value === opt.value ? 'text-[#0F172A] font-medium' : 'text-[#334155]'}`}
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
    const { filteredData, filters, updateFilter, meta } = useFilterContext();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleExportCSV = () => {
        if (!user) {
            alert("Please sign in from the home page to download reports.");
            return;
        }

        if (!filteredData || filteredData.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ["ID", "Fiscal Year", "Quarter", "Division", "District", "Department", "Allocated", "Released", "Spent", "Utilization", "Leakage Score"];
        const rows = filteredData.map(d => [
            d.id,
            d.fiscalYear,
            d.quarter,
            d.divisionName,
            d.district,
            d.departmentName,
            d.allocated,
            d.released,
            d.spent,
            d.utilization,
            d.leakageScore
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `budget_data_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!user) {
            alert("Please sign in from the home page to download reports.");
            return;
        }
        navigate('/dashboard/export');
    };

    const years = meta?.fiscalYears || [];

    // Format year options
    const yearOptions = years.map(y => ({
        value: y,
        label: y.startsWith('All') ? y : `FY ${y}`
    }));

    // Extract all districts from DIVISIONS and sort them alphabetically
    const allDistricts = Object.values(DIVISIONS)
        .flatMap(div => div.districts)
        .sort((a, b) => a.localeCompare(b));

    const districtOptions = allDistricts.map(d => ({ value: d, label: d }));

    return (
        <header className="h-16 bg-[#1E3A8A] border-b border-[#1E3A8A] flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Title + Live Sync */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-xs text-white font-medium">Live Sync</span>
                </div>
            </div>

            {/* Right: Filters + Actions */}
            <div className="flex items-center gap-3">
                {/* Custom District Dropdown */}
                <Dropdown
                    value={filters.district}
                    options={districtOptions}
                    onChange={(val) => updateFilter('district', val)}
                    placeholder="All Districts"
                />

                {/* Custom FY Dropdown */}
                <Dropdown
                    value={filters.fiscalYear}
                    options={yearOptions}
                    onChange={(val) => updateFilter('fiscalYear', val)}
                    placeholder="All Years"
                />

                {/* Export Buttons */}
                <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors border-r border-white/20" title="Export to CSV">
                        <Download size={14} />
                        CSV
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors" title="Export to PDF">
                        <FileText size={14} />
                        PDF
                    </button>
                </div>
            </div>
        </header>
    );
}
