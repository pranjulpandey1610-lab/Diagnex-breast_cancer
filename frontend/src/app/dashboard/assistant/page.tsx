"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, X, Bot, User, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export default function AssistantChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start session on mount
    const startSession = async () => {
      try {
        const res = await api.post("/assistant/session");
        setSessionId(res.data.session_id);
        setMessages([
          {
            id: "msg-1",
            role: "assistant",
            content: res.data.assistant_message
          }
        ]);
        setQuickReplies(res.data.quick_replies || []);
      } catch (err) {
        console.error("Failed to start session", err);
      }
    };
    startSession();
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, quickReplies, inputValue]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !sessionId || loading) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setQuickReplies([]);
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post(`/assistant/session/${sessionId}/message`, { content: userMsg });
      
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString() + "-ai", role: "assistant", content: res.data.assistant_message }
      ]);
      setQuickReplies(res.data.quick_replies || []);
      
      // If the AI asks if we are ready to review, we could show a distinct button, but a quick reply works too
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReplySelect = (reply: string) => {
    if (reply === "Ready to review") {
      // Special action
      if (sessionId) {
        router.push(`/dashboard/assistant/summary?session_id=${sessionId}`);
      }
      return;
    }
    setInputValue(reply);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white/50 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg shadow-blue-900/5">
      
      {/* Header */}
      <div className="bg-white/80 border-b border-slate-200/60 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Symptom Assistant</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Secure, private consultation
            </p>
          </div>
        </div>
        {sessionId && (
          <button 
            onClick={() => router.push(`/dashboard/assistant/summary?session_id=${sessionId}`)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4" /> Finalize
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed
                  ${msg.role === "user" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm" 
                    : "bg-white border border-slate-200/60 text-slate-700 rounded-bl-sm"
                  }
                `}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mb-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mb-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200/60 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 border-t border-slate-200/60 backdrop-blur-md">
        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <AnimatePresence>
              {quickReplies.map((qr) => (
                <motion.button
                  key={qr}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleQuickReplySelect(qr)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm border
                    ${qr === "Ready to review" 
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"}
                  `}
                >
                  {qr}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="relative flex items-center group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            placeholder="Type your symptoms here..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-24 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px] disabled:opacity-50"
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Clear input"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
          Do not include personally identifiable information. This is an AI assistant, not a clinician.
        </p>
      </div>
    </div>
  );
}
