"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Collected = { side: string | null; location: string[]; symptoms: string[]; context: string[] };
type Conversation = { role: "assistant" | "user"; text: string };
const emptyState: Collected = { side: null, location: [], symptoms: [], context: [] };

export default function AssistantPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<Collected>(emptyState);
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.post("/assistant/session").then(({ data }) => {
      if (!active) return;
      setSessionId(data.session_id);
      setItems(data.cumulative_state || emptyState);
      setQuickReplies(data.quick_replies || []);
      setMessages([{ role: "assistant", text: data.assistant_message }]);
    }).catch(() => active && setError("We could not start a private session. Please sign in again and retry."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const choose = (value: string) => setChosen((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const remove = (key: keyof Collected, value: string) => setItems((current) => {
    if (key === "side") return { ...current, side: null };
    return { ...current, [key]: current[key].filter((item) => item !== value) };
  });
  const send = async () => {
    const answer = [...chosen, typed.trim()].filter(Boolean).join(", ");
    if (!answer || !sessionId || sending) return;
    setSending(true); setError("");
    try {
      const { data } = await api.post(`/assistant/session/${sessionId}/message`, { content: answer });
      setItems(data.cumulative_state || emptyState);
      setQuickReplies(data.quick_replies || []);
      setMessages((current) => [...current, { role: "user", text: answer }, { role: "assistant", text: data.assistant_message }]);
      setChosen([]); setTyped("");
    } catch { setError("Your answer was not sent. It remains editable here—please try again."); }
    finally { setSending(false); }
  };
<<<<<<< HEAD
  if (loading) return <div className="p-10 text-slate-500 flex gap-2"><LoaderCircle className="animate-spin" /> Starting your private session…</div>;
  if (error && !sessionId) return <div className="glass-panel p-7 text-slate-700">{error}</div>;
  return <div className="assistant-layout"><section className="assistant-main"><div className="assistant-top"><span className="assistant-icon"><MessageCircle /></span><div><p className="kicker">BREAST AWARENESS ASSISTANT</p><h1>Describe what you have noticed</h1></div></div><div className="assistant-safe"><ShieldCheck size={17} /> This guided tool organizes your words. It does not diagnose. New or persistent breast changes should be assessed by a qualified clinician.</div><div className="conversation">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}</div><div className="reply-box"><p>Select a reply, change it, or write your own words. Nothing sends until you select Send.</p><div className="quick-options">{quickReplies.map((reply) => <button aria-pressed={chosen.includes(reply)} className={chosen.includes(reply) ? "picked" : ""} onClick={() => choose(reply)} key={reply}>{reply}</button>)}</div>{chosen.length > 0 && <div className="selected-answers">{chosen.map((reply) => <span key={reply}>{reply}<button aria-label={`Remove ${reply}`} onClick={() => choose(reply)}><X size={13} /></button></span>)}</div>}<div className="send-line"><input aria-label="Describe a breast change" value={typed} onChange={(event) => setTyped(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Or describe it in your own words…" /><button disabled={sending} onClick={send}>{sending ? "Sending…" : "Send"} <Send size={15} /></button></div>{error && <p role="alert" className="text-sm text-rose-700 mt-3">{error}</p>}</div><button className="btn mt-5" disabled={!sessionId} onClick={() => router.push(`/dashboard/assistant/summary?session_id=${sessionId}`)}>Review Summary <ArrowRight size={16} /></button></section><aside className="collected"><p className="kicker">INFORMATION COLLECTED</p><h2>Your editable notes</h2>{(Object.entries(items) as [keyof Collected, Collected[keyof Collected]][]).map(([key, values]) => { const list = key === "side" ? (values ? [values as string] : []) : values as string[]; return <div className="collected-group" key={key}><small>{key}</small>{list.length ? list.map((value) => <span key={value}>{value}<button aria-label={`Remove ${value}`} onClick={() => remove(key, value)}><X size={12} /></button></span>) : <p>Not added yet</p>}</div>; })}<p className="data-note">Your answers are not used to automatically train any model.</p></aside></div>;
=======

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
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white0 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg shadow-blue-900/5">
      
      {/* Header */}
      <div className="bg-white/80 border-b border-slate-200/60 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl shadow-sm text-slate-900">
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-slate-900 shrink-0 shadow-sm mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed
                  ${msg.role === "user" 
                    ? "bg-gradient-to-r from-blue-600 to-sky-600 text-slate-900 rounded-br-sm" 
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-slate-900 shrink-0 shadow-sm mb-1">
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
              className="p-2.5 bg-blue-600 text-slate-900 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
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
>>>>>>> bcc08286bf2bb7aa73724fd69d45e537e6fea233
}
