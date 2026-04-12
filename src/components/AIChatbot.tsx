import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, Mic, MessageCircle, X, Search } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm ZivoHR AI. I'm here to help you with Zimbabwean labour laws, contracts, payroll, and any HR challenges your SME might face. How can I assist you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing. Please add it to your environment variables.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const conversationHistory = messages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...conversationHistory, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: "You are 'ZivoHR AI', an elite AI HR assistant for ZivoHR, a platform built for SMEs in Zimbabwe and Africa. You are an expert in the Zimbabwean Labour Act, NEC regulations, and local compliance (NSSA, PAYE, ZIMDEF). You are professional, helpful, and concise. You help with employee records, hiring, performance, and company policies. Always maintain a refined, Apple-style tone. If asked about specific laws, reference the Zimbabwean Labour Act where applicable.",
        }
      });

      const assistantMessage = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getWhatsAppMessage = () => {
    const path = window.location.hash || 'home';
    return encodeURIComponent(`Hi! I'm looking at the ${path} section of ZivoHR and would like to chat with a human.`);
  };

  return (
    <>
      {/* Consolidated Floating Actions */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
        <AnimatePresence>
          {isActionsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col items-end gap-3 mb-2"
            >
              {/* WhatsApp Button */}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`https://wa.me/1234567890?text=${getWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white border border-black/[0.05] shadow-xl rounded-2xl px-4 py-3 group hover:bg-apple-gray transition-all"
              >
                <span className="text-xs font-bold text-space-gray">Chat with Support</span>
                <div className="w-10 h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
              </motion.a>

              {/* AI Assistant Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsOpen(true);
                  setIsActionsOpen(false);
                }}
                className="flex items-center gap-3 bg-white border border-black/[0.05] shadow-xl rounded-2xl px-4 py-3 group hover:bg-apple-gray transition-all"
              >
                <span className="text-xs font-bold text-space-gray">Ask ZivoHR AI</span>
                <div className="w-10 h-10 bg-gradient-to-tr from-[#4285F4] via-[#9171E5] to-[#F06292] text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          className={cn(
            "w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500",
            isActionsOpen ? "bg-space-gray text-white rotate-90" : "bg-accent text-white"
          )}
        >
          {isActionsOpen ? <X className="w-6 h-6" /> : (
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-8 w-full sm:w-[400px] h-full sm:h-[600px] bg-white/95 backdrop-blur-2xl sm:rounded-[2.5rem] shadow-2xl border-t sm:border border-black/[0.05] flex flex-col overflow-hidden z-[110]"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-black/[0.03] flex items-center justify-between bg-apple-gray/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-space-gray">ZivoHR AI</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online • HQ: Harare
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    msg.role === 'assistant' ? "bg-apple-gray text-accent" : "bg-accent text-white"
                  )}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'assistant' ? "bg-apple-gray/50 text-space-gray" : "bg-accent text-white"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-apple-gray text-accent flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-apple-gray/50 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 border-t border-black/[0.03] bg-white">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me about labour laws, contracts..."
                    className="w-full bg-apple-gray border-none rounded-2xl pl-4 pr-12 py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-xl disabled:opacity-30 shadow-lg shadow-accent/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center gap-4 text-gray-400">
                  <button className="hover:text-space-gray transition-colors p-1"><Paperclip className="w-5 h-5" /></button>
                  <button className="hover:text-space-gray transition-colors p-1"><Mic className="w-5 h-5" /></button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Powered by ZivoHR AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

