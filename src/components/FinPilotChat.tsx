import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, ShieldCheck, Sparkles, ArrowRight,
  Calculator, User, RefreshCw
} from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../api';

interface FinPilotChatProps {
  onOpenEvidence: (evidenceId: string) => void;
  selectedMonth: string;
  theme?: 'light' | 'dark';
}

export const FinPilotChat: React.FC<FinPilotChatProps> = ({
  onOpenEvidence,
  selectedMonth,
  theme = 'light'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_intro',
      sender: 'assistant',
      text: "Hello! I'm FinPilot, your personal finance decision support co-pilot. Every number I share is calculated deterministically by our verified local analytics engine. Ask me about your free cash flow, recurring commitments, spending shifts, or goal timelines.\n\n*Insights only, not financial advice.*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How much of my income is truly free this month?',
    'Why did my food spending increase last month?',
    'What happens to my laptop goal if I reduce shopping by ₹1,000?',
    'Are there any days my balance might get tight?',
    'Show me my subscriptions and any price changes',
    'Do I have any spending anomalies?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(textToSend, selectedMonth);
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidence_id: res.evidence_id,
        tool_used: res.tool_used,
        structured_data: res.structured_data,
        privacy_tokens_masked: res.privacy_tokens_masked,
        masked_fields: res.masked_fields
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to connect to FinPilot analysis engine. Please try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* PrivacyGuard & Architecture Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        theme === 'light'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg shrink-0 border ${
            theme === 'light'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className={`font-semibold ${theme === 'light' ? 'text-emerald-900' : 'text-white'}`}>
              PrivacyGuard Active
            </span>
            <p className={`text-[11px] ${theme === 'light' ? 'text-emerald-800' : 'text-slate-400'}`}>
              Sensitive account tokens and names are sanitized locally before AI interpretation.
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-[11px] shrink-0 font-medium ${
          theme === 'light' ? 'text-emerald-800' : 'text-cyan-400'
        }`}>
          <Calculator className="w-3.5 h-3.5" />
          <span>Pandas Verified Engine</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className={`border rounded-2xl h-[540px] flex flex-col overflow-hidden shadow-xl ${
        theme === 'light'
          ? 'bg-white border-slate-200 shadow-slate-200/60'
          : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : theme === 'light'
                    ? 'bg-cyan-50 border border-cyan-200 text-cyan-700'
                    : 'bg-slate-800 border border-slate-700 text-cyan-400'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : theme === 'light'
                      ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Privacy Badge & Evidence Link on Assistant Messages */}
                {m.sender === 'assistant' && (
                  <div className="flex flex-wrap items-center gap-2 px-1 text-[11px]">
                    {m.tool_used && (
                      <span className={`px-2 py-0.5 rounded border font-mono ${
                        theme === 'light'
                          ? 'bg-slate-100 border-slate-200 text-slate-600'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}>
                        {m.tool_used}()
                      </span>
                    )}

                    {m.privacy_tokens_masked && m.privacy_tokens_masked > 0 ? (
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${
                        theme === 'light'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      }`}>
                        🛡️ {m.privacy_tokens_masked} token(s) sanitized
                      </span>
                    ) : null}

                    {m.evidence_id && (
                      <button
                        onClick={() => onOpenEvidence(m.evidence_id!)}
                        className="flex items-center gap-1 font-semibold text-cyan-600 hover:text-cyan-700 ml-auto"
                      >
                        <span>ProofTrail Evidence</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                theme === 'light'
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                  : 'bg-slate-800 border border-slate-700 text-cyan-400'
              }`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-400'
              }`}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>Sanitizing identifiers & executing verified Python tool...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Shelf */}
        <div className={`px-4 py-2.5 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs ${
          theme === 'light'
            ? 'bg-slate-50/80 border-slate-200'
            : 'bg-slate-950/50 border-slate-800/80'
        }`}>
          <span className={`text-[11px] shrink-0 font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Try asking:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] whitespace-nowrap transition ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-slate-300'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className={`p-3 border-t flex items-center gap-2 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FinPilot a decision question..."
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
            }`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
