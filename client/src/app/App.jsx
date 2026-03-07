import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { FilterProvider } from '../context/FilterContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import Analytics from '../pages/Analytics';
import Anomalies from '../pages/Anomalies';
import Predict from '../pages/Predict';
import Chat from '../pages/Chat';
import Reports from '../pages/Reports';
import Leaderboard from '../pages/Leaderboard';
import BudgetFlowVisualization from '../pages/BudgetFlowVisualization';
import DistrictComparisonMode from '../pages/DistrictComparisonMode';

function AuthenticatedRoutes() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Landing />} />

                {/* Dashboard routes wrapped in FilterProvider */}
                <Route element={
                    <FilterProvider>
                        <DashboardLayout />
                    </FilterProvider>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/analytics" element={<Analytics />} />
                    <Route path="/dashboard/anomalies" element={<Anomalies />} />
                    <Route path="/dashboard/predict" element={<Predict />} />
                    <Route path="/dashboard/chat" element={<Chat />} />
                    <Route path="/dashboard/reports" element={<Reports />} />
                    <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
                    <Route path="/dashboard/budget-flow" element={<BudgetFlowVisualization />} />
                    <Route path="/dashboard/comparison" element={<DistrictComparisonMode />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Budget Flow – standalone, no auth/firebase required */}
                <Route path="/budget-flow" element={<BudgetFlowVisualization />} />

                {/* Everything else goes through auth */}
                <Route path="*" element={<AuthenticatedRoutes />} />
            </Routes>
        </BrowserRouter>
    );
}
