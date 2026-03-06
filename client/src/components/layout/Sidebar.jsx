import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, AlertTriangle, BarChart2,
    Settings, ArrowLeftRight
} from 'lucide-react';
import { APP_NAME } from '../../config/constants';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/analytics', icon: TrendingUp, label: 'Fund Flows' },
    { path: '/dashboard/anomalies', icon: AlertTriangle, label: 'Leakage Detection' },
    { path: '/dashboard/predict', icon: BarChart2, label: 'Department Analysis' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-60 h-screen bg-[#15151d] border-r border-[#2a2a3a] flex flex-col fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="px-5 py-6 flex items-center gap-3 border-b border-[#2a2a3a]">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    B
                </div>
                <div>
                    <h1 className="font-bold text-white text-sm leading-tight">{APP_NAME}</h1>
                    <p className="text-[11px] text-[#6b7280] leading-tight">Maharashtra State</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                                ${isActive
                                    ? 'bg-[#f97316]/10 text-[#f97316] border-l-2 border-[#f97316] ml-0'
                                    : 'text-[#6b7280] hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                }`}
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom: Switch Role */}
            <div className="px-3 py-4 border-t border-[#2a2a3a]">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6b7280] hover:text-white hover:bg-white/5 transition-colors w-full">
                    <ArrowLeftRight size={18} />
                    <span>Switch to Officer Role</span>
                </button>
            </div>
        </aside>
    );
}
