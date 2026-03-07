import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, AlertTriangle, BarChart2,
    ArrowLeftRight, Droplets, GitCompareArrows
} from 'lucide-react';
import { APP_NAME } from '../../config/constants';
import logoUrl from '../../assets/logo.png';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/analytics', icon: TrendingUp, label: 'Fund Flows' },
    { path: '/dashboard/budget-flow', icon: Droplets, label: 'Budget Flow' },
    { path: '/dashboard/anomalies', icon: AlertTriangle, label: 'Leakage Detection' },
    { path: '/dashboard/predict', icon: BarChart2, label: 'Department Analysis' },
    { path: '/dashboard/comparison', icon: GitCompareArrows, label: 'Compare Intel' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-60 h-screen bg-[#1E3A8A] flex flex-col fixed left-0 top-0 z-40">
            {/* Logo */}
            <Link to="/" className="px-5 py-6 flex items-center gap-3 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-lg object-cover bg-white p-0.5 flex-shrink-0" />
                <div>
                    <h1 className="font-bold text-white text-sm leading-tight">{APP_NAME}</h1>
                    <p className="text-[11px] text-white/60 leading-tight">Maharashtra State</p>
                </div>
            </Link>

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
                                    ? 'bg-white/15 text-white border-l-2 border-white ml-0'
                                    : 'text-white/60 hover:text-white hover:bg-white/10 border-l-2 border-transparent'
                                }`}
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

        </aside>
    );
}
