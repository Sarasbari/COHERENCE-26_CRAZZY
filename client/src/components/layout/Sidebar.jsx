import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, AlertTriangle, BarChart2,
    ArrowLeftRight, Droplets, GitCompareArrows, Languages, Landmark, UserCircle
} from 'lucide-react';
import { APP_NAME } from '../../config/constants';
import logoUrl from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/analytics', icon: TrendingUp, label: 'Fund Flows' },
    { path: '/dashboard/budget-flow', icon: Droplets, label: 'Budget Flow' },
    { path: '/dashboard/budget-overview', icon: Landmark, label: 'Budget Overview' },
    { path: '/dashboard/anomalies', icon: AlertTriangle, label: 'Leakage Detection' },
    { path: '/dashboard/predict', icon: BarChart2, label: 'Department Analysis' },
    { path: '/dashboard/comparison', icon: GitCompareArrows, label: 'Compare Intel' },
    { path: '/dashboard/export', icon: Languages, label: 'Export Reports' },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { user, login, logout } = useAuth();

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#1E3A8A] flex flex-col transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0`}
        >
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
                            onClick={() => onClose?.()}
                            className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative min-h-[44px]
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

            {/* User Profile / Login */}
            <div className="p-4 border-t border-white/10 mt-auto">
                {user ? (
                    <div className="flex items-center gap-3">
                        <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10" referrerPolicy="no-referrer" />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-semibold text-white truncate">{user.displayName || 'User'}</span>
                            <button onClick={logout} className="text-xs text-left text-white/60 hover:text-white transition">Sign Out</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center flex-shrink-0">
                            <UserCircle size={20} className="text-white/40" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-semibold text-white/80 truncate">Guest User</span>
                            <button onClick={login} className="text-xs text-left text-blue-300 hover:text-blue-200 transition font-medium">Sign in</button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
