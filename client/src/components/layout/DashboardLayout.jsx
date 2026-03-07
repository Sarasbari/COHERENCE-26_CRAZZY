import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatBot from '../chat/ChatBot';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Dark overlay on mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 md:ml-60 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main id="dashboard-pdf-content" className="flex-1 p-4 md:p-6 overflow-y-auto relative bg-[#F8FAFC] pb-20 md:pb-6">
                    <Outlet />
                </main>
            </div>
            {/* Global ChatBot Mount */}
            <ChatBot />
        </div>
    );
}
