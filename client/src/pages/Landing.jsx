import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Shield, Zap, TrendingUp, Brain, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../config/constants';
import InteractiveGlobe from '../components/ui/InteractiveGlobe';

const features = [
    { icon: BarChart3, title: 'Fund Flow Tracking', desc: 'Visualize budget allocation across divisions and departments with interactive Sankey diagrams' },
    { icon: Shield, title: 'Anomaly Detection', desc: 'Three-layer intelligence engine detects underspending, spikes, and statistical outliers' },
    { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Forecast fund lapse risks and spending velocity with data-driven predictions' },
    { icon: Brain, title: 'AI-Powered Insights', desc: 'Groq-powered natural language analysis explains anomalies and recommends actions' },
    { icon: Zap, title: 'Corruption Risk Score', desc: 'Composite 0-100 risk scoring per district and department based on spending patterns' },
];

const stats = [
    { label: 'Divisions Tracked', value: '3' },
    { label: 'Departments Monitored', value: '8' },
    { label: 'Years of Data', value: '5' },
    { label: 'Detection Layers', value: '3' },
];

export default function Landing() {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const handleGetStarted = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-5 border-b border-[#E2E8F0] bg-white">
                <div className="flex items-center gap-3">
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-[#3B82F6]/20 rounded-xl blur-md transition-all duration-500 group-hover:bg-[#3B82F6]/40 group-hover:scale-110"></div>
                        <img src="/logo.png" alt="Logo" className="w-11 h-11 relative z-10 shadow-sm rounded-xl object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="font-bold text-[#0F172A] text-xl">{APP_NAME}</span>
                </div>
                <button onClick={handleGetStarted} className="btn-primary flex items-center gap-2">
                    {user ? 'Go to Dashboard' : 'Sign In with Google'}
                    <ArrowRight size={16} />
                </button>
            </nav>

            {/* Hero — Two-column: Text Left + Globe Right */}
            <section className="relative px-8 py-16 md:py-24">
                {/* Ambient glow — left side */}
                <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-gradient-radial from-[#3B82F6]/5 via-transparent to-transparent blur-3xl pointer-events-none" />
                {/* Ambient glow — right side for globe */}
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-radial from-[#1E3A8A]/5 via-transparent to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                    {/* Left — Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 max-w-xl lg:max-w-none"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[#1E3A8A] text-sm mb-8">
                            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                            Maharashtra State Budget Intelligence
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight">
                            Track. Detect.{' '}
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
                                Optimize.
                            </span>
                        </h1>

                        {/* Subtext */}
                        <p className="mt-6 text-base md:text-lg text-[#64748B] max-w-lg leading-relaxed">
                            AI-powered platform tracking public fund flows across
                            Amravati, Nagpur &amp; Aurangabad divisions — detecting leakages, forecasting
                            risks, and enabling data-driven governance.
                        </p>

                        {/* Stats row */}
                        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-xl font-bold gradient-text">{stat.value}</span>
                                    <span className="text-[#94A3B8]">{stat.label}</span>
                                    {i < stats.length - 1 && (
                                        <span className="hidden sm:block w-px h-5 bg-[#E2E8F0] ml-4" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <div className="mt-10 flex items-center gap-4">
                            <button onClick={handleGetStarted} className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                                Launch Dashboard
                                <ArrowRight size={20} />
                            </button>
                            <a href="#features" className="btn-secondary flex items-center gap-2">
                                Explore Features
                            </a>
                        </div>
                    </motion.div>

                    {/* Right — Globe */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="flex-1 flex items-center justify-center min-h-[360px] md:min-h-[460px]"
                    >
                        <InteractiveGlobe
                            size={460}
                            autoRotateSpeed={0.002}
                            dotColor="rgba(30, 58, 138, ALPHA)"
                            arcColor="rgba(59, 130, 246, 0.4)"
                            markerColor="rgba(59, 130, 246, 1)"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Stats bar */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="relative z-10 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 glass-card px-10 py-6 -mt-4 mb-12"
            >
                {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                        <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                        <p className="text-sm text-[#94A3B8] mt-1">{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Features */}
            <section id="features" className="px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-[#0F172A]">Intelligent Budget Monitoring</h2>
                    <p className="text-[#64748B] mt-3">Powered by multi-layer anomaly detection and AI analysis</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card-hover p-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center mb-4">
                                <feature.icon size={24} className="text-[#1E3A8A]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{feature.title}</h3>
                            <p className="text-sm text-[#64748B] leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#E2E8F0] px-8 py-8 text-center text-[#94A3B8] text-sm">
                <p>© 2026 {APP_NAME} — National ARTHRAKSHAK Intelligence Platform | Built for COHERENCE Hackathon</p>
            </footer>
        </div>
    );
}
