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
  if (loading) return <div className="p-10 text-slate-500 flex gap-2"><LoaderCircle className="animate-spin" /> Starting your private session…</div>;
  if (error && !sessionId) return <div className="glass-panel p-7 text-slate-700">{error}</div>;
  return <div className="assistant-layout"><section className="assistant-main"><div className="assistant-top"><span className="assistant-icon"><MessageCircle /></span><div><p className="kicker">BREAST AWARENESS ASSISTANT</p><h1>Describe what you have noticed</h1></div></div><div className="assistant-safe"><ShieldCheck size={17} /> This guided tool organizes your words. It does not diagnose. New or persistent breast changes should be assessed by a qualified clinician.</div><div className="conversation">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}</div><div className="reply-box"><p>Select a reply, change it, or write your own words. Nothing sends until you select Send.</p><div className="quick-options">{quickReplies.map((reply) => <button aria-pressed={chosen.includes(reply)} className={chosen.includes(reply) ? "picked" : ""} onClick={() => choose(reply)} key={reply}>{reply}</button>)}</div>{chosen.length > 0 && <div className="selected-answers">{chosen.map((reply) => <span key={reply}>{reply}<button aria-label={`Remove ${reply}`} onClick={() => choose(reply)}><X size={13} /></button></span>)}</div>}<div className="send-line"><input aria-label="Describe a breast change" value={typed} onChange={(event) => setTyped(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Or describe it in your own words…" /><button disabled={sending} onClick={send}>{sending ? "Sending…" : "Send"} <Send size={15} /></button></div>{error && <p role="alert" className="text-sm text-rose-700 mt-3">{error}</p>}</div><button className="btn mt-5" disabled={!sessionId} onClick={() => router.push(`/dashboard/assistant/summary?session_id=${sessionId}`)}>Review Summary <ArrowRight size={16} /></button></section><aside className="collected"><p className="kicker">INFORMATION COLLECTED</p><h2>Your editable notes</h2>{(Object.entries(items) as [keyof Collected, Collected[keyof Collected]][]).map(([key, values]) => { const list = key === "side" ? (values ? [values as string] : []) : values as string[]; return <div className="collected-group" key={key}><small>{key}</small>{list.length ? list.map((value) => <span key={value}>{value}<button aria-label={`Remove ${value}`} onClick={() => remove(key, value)}><X size={12} /></button></span>) : <p>Not added yet</p>}</div>; })}<p className="data-note">Your answers are not used to automatically train any model.</p></aside></div>;
}
