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
    }, [isOpen]); // Re-attach if needed when panel opens

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            priorInputRef.current = input; // Save whatever text is already there
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                // Ignore if it's already started accidentally
                console.error(e);
            }
        }
    };

    // Auto scroll to bottom when messages or streaming text changes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingText, isOpen]);

    const suggestions = [
        "Which district has highest leakage?",
        "Show Nagpur fund utilization",
        "Forecast risk for Q1 FY25"
    ];

    const handleSend = async (text) => {
        const query = text || input;
        if (!query.trim()) return;

        // 1. Add user message to chat UI immediately
        const newMessages = [...messages, { role: 'user', content: query }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setStreamingText('');
        setCurrentSource('');

        try {
            // 2. RAG: Load relevant local data chunks based on the query
            const { contextText, sourceFile } = await loadDatasetContext(query);
            setCurrentSource(sourceFile);

            // 3. Send query + context to Llama API
            const response = await sendMessage(query, contextText, newMessages.map(m => ({ role: m.role, content: m.content })));

            // 4. Handle HTTP Stream Response
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let fullAiResponse = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);

                // Parse SSE chunks. The Groq/OpenAI format sends `data: {...}` blocks.
                const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.replace(/^data: /, '').trim() === '[DONE]') {
                        done = true;
                        break;
                    }
                    if (line.startsWith('data:')) {
                        try {
                            const parsed = JSON.parse(line.replace(/^data: /, ''));
                            if (parsed.choices && parsed.choices[0].delta.content) {
                                fullAiResponse += parsed.choices[0].delta.content;
                                setStreamingText(fullAiResponse); // Update UI progressively
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }

            // 5. Stream complete, commit to messages array
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: fullAiResponse,
                source: sourceFile
            }]);
            setStreamingText('');

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Error:** ${error.message || "Failed to connect to the AI model."}\n\n*Make sure you added the VITE_LLAMA_API_KEY in the .env file!*`
            }]);
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
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
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
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold font-mono">
                                    B
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-base leading-tight">BudgetFlow AI</h2>
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
                                        <h3 className="text-white font-bold text-lg mb-1">Ask BudgetFlow AI</h3>
                                        <p className="text-sm text-gray-400 max-w-[250px] mx-auto">
                                            Answers grounded in Maharashtra FY 2023-24 budget data
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
                                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {msg.role === 'assistant' && (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                                                        B
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1">
                                                    <div className={`p-3.5 text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl rounded-tr-[4px]'
                                                        : 'bg-[#1e1e28]/80 backdrop-blur-md text-gray-100 border border-[#334155]/40 rounded-2xl rounded-tl-[4px]'
                                                        }`}>
                                                        {msg.content}
                                                    </div>

                                                    {/* Source Tag for RAG */}
                                                    {msg.role === 'assistant' && msg.source && (
                                                        <div className="flex items-center gap-1 mt-1 ml-1">
                                                            <span className="text-[10px] text-gray-500">📄 Source: {msg.source}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* STREAMING / LOADING INDICATOR */}
                                    {(isLoading || streamingText) && (
                                        <div className="flex items-start gap-3 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                                                B
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="p-3.5 text-[15px] leading-relaxed shadow-sm bg-[#1e1e28]/80 backdrop-blur-md text-gray-100 border border-[#334155]/40 rounded-2xl rounded-tl-[4px] min-h-[46px] min-w-[60px]">
                                                    {streamingText ? (
                                                        <span>{streamingText}<span className="inline-block w-1.5 h-3 ml-0.5 bg-orange-500 animate-pulse" /></span>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 h-full pt-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                    )}
                                                </div>
                                                {currentSource && !streamingText && (
                                                    <div className="flex items-center gap-1 mt-1 ml-1">
                                                        <span className="text-[10px] text-gray-500">📄 Searching: {currentSource}...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT BAR */}
                        <div className="p-4 bg-[#1e1e28]/80 backdrop-blur-xl border-t border-[#334155]/30">
                            <div className="relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about Maharashtra budget data..."
                                    disabled={isLoading}
                                    className="w-full bg-[#15151d]/60 text-white border border-[#334155]/40 rounded-2xl pl-4 pr-24 py-3.5 text-[15px] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none disabled:opacity-50 placeholder-gray-500"
                                    rows="1"
                                    style={{ minHeight: '52px', maxHeight: '120px' }}
                                />

                                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                    <button
                                        onClick={toggleListening}
                                        disabled={isLoading}
                                        className={`p-2 rounded-xl transition-colors relative ${isListening ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'} disabled:opacity-30`}
                                        title={isListening ? "Stop listening" : "Dictate message"}
                                    >
                                        {isListening && <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping"></span>}
                                        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                                    </button>

                                    <button
                                        onClick={() => handleSend(input)}
                                        disabled={!input.trim() || isLoading}
                                        className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-30 hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center cursor-pointer"
                                    >
                                        <Send size={18} className={`${isLoading ? 'translate-x-1 opacity-50' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1">
                                <span>🔒</span> Responses grounded in verified government data
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
