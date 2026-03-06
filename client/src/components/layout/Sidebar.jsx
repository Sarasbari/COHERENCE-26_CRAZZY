import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, BarChart3, AlertTriangle, TrendingUp,
    MessageSquare, FileText, Trophy, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../config/constants';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/anomalies', icon: AlertTriangle, label: 'Anomalies' },
    { path: '/dashboard/predict', icon: TrendingUp, label: 'Predictions' },
    { path: '/dashboard/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { path: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const location = useLocation();

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`${collapsed ? 'w-20' : 'w-64'} h-screen bg-surface-900/80 backdrop-blur-xl border-r border-white/5 
                   flex flex-col transition-all duration-300 fixed left-0 top-0 z-40`}
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center font-bold text-navy-950 text-lg flex-shrink-0">
                    B
                </div>
                {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 className="font-bold text-white text-lg">{APP_NAME}</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Intelligence Platform</p>
                    </motion.div>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                            {isActive && !collapsed && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400"
                                />
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User & Collapse */}
            <div className="p-4 border-t border-white/5 space-y-2">
                {!collapsed && user && (
                    <div className="flex items-center gap-3 px-3 py-2">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-sm font-bold">
                                {user.displayName?.[0] || 'U'}
                            </div>
                        )}
                        <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                            <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                <button onClick={logout} className="sidebar-link w-full text-red-400/70 hover:text-red-400" title="Logout">
                    <LogOut size={20} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-link w-full justify-center"
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </motion.aside>
    );
}
