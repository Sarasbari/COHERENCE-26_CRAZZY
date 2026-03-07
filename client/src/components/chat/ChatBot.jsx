import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage } from '../../services/chat';
import { loadDatasetContext } from '../../services/rag';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // streamingText handles the live typing effect before it becomes a full message
    const [streamingText, setStreamingText] = useState('');
    const [currentSource, setCurrentSource] = useState('');

    // Web Speech API states
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const priorInputRef = useRef(''); // Stores input typed before starting mic

    const messagesEndRef = useRef(null);

    // Initialize Web Speech API
    useEffect(() => {
        if ('window' in globalThis && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let currentTranscript = '';
                // Read from 0 to length for the current active recognition session
                for (let i = 0; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                // Append the current session's transcript to whatever was typed before
                const prefix = priorInputRef.current;
                setInput(prefix ? prefix + ' ' + currentTranscript : currentTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [isOpen]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            priorInputRef.current = input; // Save whatever text is already there
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingText, isOpen]);

    const suggestions = [
        "Which district has highest leakage?",
        "Show Nagpur fund utilization",
        "Forecast risk for Q1 FY25"
    ];

    const handleSend = async (textOvr) => {
        const query = textOvr || input;
        if (!query.trim()) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setIsLoading(true);
        setCurrentSource('');

        try {
            // 1. RAG Simulation: Get matching context
            const ragData = await loadDatasetContext(query);
            setCurrentSource(ragData.sourceFile);

            const systemPrompt = `You are "BudgetFlow AI", an expert assistant analyzing the Maharashtra State Budget dataset.
            The user is asking a question about the budget. Base your answer purely on the provided context below.
            If the answer is not in the context, confidently say you don't have that information.
            Keep your answer short, professional, and clear.
            
            CONTEXT DATA:
            ${ragData.contextText}
            `;

            // 2. LLM Call: Stream the response
            const newMessages = [...messages, { role: 'user', content: query }];
            const reader = await sendMessage(newMessages, systemPrompt);
            const decoder = new TextDecoder("utf-8");

            let accumulatedMsg = '';
            setStreamingText('');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.replace('data: ', '').trim();
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            const token = parsed.choices[0]?.delta?.content || '';
                            accumulatedMsg += token;
                            setStreamingText(accumulatedMsg);
                        } catch (e) {
                            console.warn("Could not parse JSON stream chunk", e);
                        }
                    }
                }
            }

            // 3. Commit the final streamed text to messages array
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: accumulatedMsg,
                source: ragData.sourceFile
            }]);

            setStreamingText('');

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}. Is your API Key set in .env?`
            }]);
            setStreamingText('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform flex-shrink-0"
                >
                    {!isOpen && <span className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-75"></span>}
                    {isOpen ? <X size={24} /> : <Bot size={24} />}
                </button>
            </div>

            {/* BACKDROP */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 z-40"
                    />
                )}
            </AnimatePresence>

            {/* SLIDING SIDE PANEL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[30vw] min-w-[360px] bg-[#15151d]/95 backdrop-blur-2xl border-l border-[#334155]/30 shadow-[-10px_0_30px_rgba(0,0,0,0.4)] z-50 flex flex-col"
                    >
                        {/* HEADER */}
                        <div className="p-4 border-b border-[#334155]/30 flex items-center justify-between bg-gradient-to-b from-[#1e1e28]/80 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-base leading-tight">ARTHRAKSHAK AI</h2>
                                    <p className="text-xs text-gray-400 leading-tight">Powered by Llama 3.3 70B</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2">
                                <X size={20} />
                            </button>
                        </div>

                        {/* RAG INDICATOR */}
                        <div className="bg-[#1e1e28]/30 py-2 px-4 flex items-center gap-2 border-b border-[#334155]/30">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[11px] font-medium text-gray-300 tracking-wide uppercase">RAG Active — Maharashtra Dataset</span>
                        </div>

                        {/* CHAT AREA */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[#2a2a3a] scrollbar-track-transparent">
                            {messages.length === 0 ? (
                                /* WELCOME STATE */
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-10">
                                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                                        <Bot size={32} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-1">Ask ARTHRAKSHAK AI</h3>
                                        <p className="text-sm text-gray-400 max-w-[250px] mx-auto">
                                            Answers grounded in Maharashtra state budget data
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full mt-4">
                                        {suggestions.map((sug, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(sug)}
                                                className="px-4 py-2.5 rounded-xl border border-[#334155]/40 bg-white/5 backdrop-blur-sm text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                                            >
                                                "{sug}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* MESSAGE HISTORY */
                                <>
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full`}>
                                            <div className="flex items-end gap-2 max-w-[85%]">
                                                {msg.role === 'assistant' && (
                                                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mb-1">
                                                        <span className="text-[10px] font-bold text-orange-500">B</span>
                                                    </div>
                                                )}

                                                <div
                                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                                                        ${msg.role === 'user'
                                                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-br-sm'
                                                            : 'bg-[#1e1e28] text-gray-200 border border-[#334155]/40 rounded-bl-sm'}
                                                    `}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                            {/* Source Pill */}
                                            {msg.source && (
                                                <div className="flex items-center gap-1 mt-2 ml-9">
                                                    <div className="w-3 h-4 bg-gray-600 rounded-[2px] opacity-70 relative">
                                                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#15151d] rounded-bl-[2px]"></div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">Source: {msg.source}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* STREAMING TEXT / LOADING INDICATOR */}
                                    {(isLoading || streamingText) && (
                                        <div className="flex items-end gap-2 max-w-[85%]">
                                            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mb-1">
                                                <span className="text-[10px] font-bold text-orange-500">B</span>
                                            </div>
                                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#1e1e28] border border-[#334155]/40 text-sm text-gray-200 leading-relaxed min-w-[60px]">
                                                {streamingText ? (
                                                    streamingText
                                                ) : (
                                                    <div className="flex gap-1.5 py-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* For source of a currently streaming message - wait till done usually, or append live if needed */}
                                    {(isLoading || streamingText) && currentSource && !streamingText.endsWith("[DONE]") && (
                                        <div className="flex items-center gap-1 mt-2 ml-9">
                                            <div className="w-3 h-4 bg-gray-600 rounded-[2px] opacity-70 relative">
                                                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#15151d] rounded-bl-[2px]"></div>
                                            </div>
                                            <span className="text-[10px] text-gray-500">Source: {currentSource}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-4 bg-[#1a1a24] border-t border-[#334155]/40">
                            <div className="relative flex items-center bg-[#15151d] border border-[#334155] rounded-2xl overflow-hidden focus-within:border-orange-500/50 transition-colors shadow-inner">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about Maharashtra budget data..."
                                    className="w-full bg-transparent text-sm text-white placeholder-gray-500 p-4 resize-none outline-none max-h-32 min-h-[56px] py-4"
                                    rows="1"
                                />

                                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                    <button
                                        onClick={toggleListening}
                                        title={isListening ? "Stop listening" : "Start listening"}
                                        className={`p-2 rounded-xl transition-all ${isListening
                                            ? 'text-red-400 bg-red-400/10 shadow-[0_0_15px_rgba(248,113,113,0.3)] animate-pulse'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>

                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className="p-2 rounded-xl bg-orange-600/20 text-orange-500 hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                                <span>🔒</span>
                                <span>Responses grounded in verified government data</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
