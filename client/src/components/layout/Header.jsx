import { Bell, ChevronDown, Download, User } from 'lucide-react';

export default function Header() {
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
                {/* All Districts dropdown */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition-colors">
                    All Districts
                    <ChevronDown size={14} className="text-white/70" />
                </button>

                {/* FY dropdown */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm text-white hover:bg-white/20 transition-colors">
                    FY 2023-24
                    <ChevronDown size={14} className="text-white/70" />
                </button>

                {/* Export */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <Download size={14} />
                    Export Data
                </button>

                {/* Bell */}
                <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Bell size={18} className="text-white/80" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full" />
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={16} className="text-white" />
                </div>
            </div>
        </header>
    );
}
