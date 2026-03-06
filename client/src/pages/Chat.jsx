import { useState } from 'react';
import { queryGroq, SUGGESTED_PROMPTS } from '../services/groqService';
import { useFilterContext } from '../context/FilterContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, User, Loader2, Sparkles } from 'lucide-react';

export default function Chat() {
    const { analysis } = useFilterContext();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (text = input) => {
        if (!text.trim() || loading) return;

        const userMsg = { role: 'user', content: text.trim(), timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const context = {
            budgetSummary: analysis?.summary,
            anomalies: analysis?.anomalies?.slice(0, 10),
        };

        const result = await queryGroq(text.trim(), context);

        const aiMsg = {
            role: 'assistant',
            content: result.message,
            timestamp: Date.now(),
            success: result.success,
        };
        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                <h2 className="text-2xl font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                    <Brain className="text-[#1E3A8A]" size={28} />
                    Ask the Budget
                </h2>
                <p className="text-[#64748B] text-sm">AI-powered conversational insights into Maharashtra's budget data</p>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                {messages.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A]/10 flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={32} className="text-[#1E3A8A]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0F172A] mb-2">What would you like to know?</h3>
                        <p className="text-[#64748B] text-sm mb-8">Ask about budget patterns, anomalies, or get recommendations</p>

                        {/* Suggested Prompts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {SUGGESTED_PROMPTS.slice(0, 6).map((prompt, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleSend(prompt)}
                                    className="text-left px-4 py-3 glass-card-hover text-sm text-[#475569] hover:text-[#0F172A]"
                                >
                                    <Sparkles size={12} className="inline mr-2 text-[#3B82F6]" />
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-[#1E3A8A]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Brain size={16} className="text-[#1E3A8A]" />
                                </div>
                            )}
                            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#1E3A8A] text-white rounded-br-sm'
                                    : 'glass-card text-[#334155] rounded-bl-sm'
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-[#3B82F6]" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1E3A8A]/10 flex items-center justify-center flex-shrink-0">
                            <Brain size={16} className="text-[#1E3A8A]" />
                        </div>
                        <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm">
                            <div className="flex items-center gap-2 text-[#64748B] text-sm">
                                <Loader2 size={14} className="animate-spin" />
                                Analyzing budget data...
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about budget allocations, anomalies, or recommendations..."
                    className="input-dark flex-1"
                    disabled={loading}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="btn-primary px-5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
