import { Bell, ChevronDown, Download, User } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-16 bg-[#0f0f13] border-b border-[#2a2a3a] flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Title + Live Sync */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-xs text-[#22c55e] font-medium">Live Sync</span>
                </div>
            </div>

            {/* Right: Filters + Actions */}
            <div className="flex items-center gap-3">
                {/* All Districts dropdown */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e28] border border-[#2a2a3a] text-sm text-white hover:border-[#3a3a4a] transition-colors">
                    All Districts
                    <ChevronDown size={14} className="text-[#6b7280]" />
                </button>

                {/* FY dropdown */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e28] border border-[#2a2a3a] text-sm text-white hover:border-[#3a3a4a] transition-colors">
                    FY 2023-24
                    <ChevronDown size={14} className="text-[#6b7280]" />
                </button>

                {/* Export */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2a2a3a] text-sm text-[#6b7280] hover:text-white hover:border-[#3a3a4a] transition-colors">
                    <Download size={14} />
                    Export Data
                </button>

                {/* Bell */}
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bell size={18} className="text-[#6b7280]" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f97316] rounded-full" />
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#2a2a3a] flex items-center justify-center">
                    <User size={16} className="text-[#6b7280]" />
                </div>
            </div>
        </header>
    );
}
