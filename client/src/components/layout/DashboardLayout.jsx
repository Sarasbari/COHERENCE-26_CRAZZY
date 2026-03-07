import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatBot from '../chat/ChatBot';

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 ml-60 flex flex-col">
                <Header />
                <main id="dashboard-pdf-content" className="flex-1 p-6 overflow-y-auto relative bg-[#F8FAFC]">
                    <Outlet />
                </main>
            </div>
            {/* Global ChatBot Mount */}
            <ChatBot />
        </div>
    );
}
