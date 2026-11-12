import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, CheckCircle2, Mic, MicOff, Brain, WifiOff } from 'lucide-react';
import Layout from '../components/Layout';
import { generateLocalReply, type Suggestion } from '../lib/assistant';
import { useTasks } from '../stores/useTasks';
import { useSettings } from '../stores/useSettings';
import { todayISO } from '../lib/date';
import { isVoiceAvailable, requestVoicePermission, startListening, stopListening } from '../lib/voice';
import { runAgent, executePending, getLastLocalReason } from '../lib/ai/agent';
import { Settings as SettingsRepo } from '../lib/repositories';
import DayPlannerModal from '../components/flows/DayPlannerModal';
import CookingModal from '../components/flows/CookingModal';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: Suggestion[];
  applied?: boolean;
  source?: 'ai' | 'local';
}



function formatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Assistant() {
  const { tasks, add, load } = useTasks();
  const { settings } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'هلا بيج يا وردة 🌸\nأنا رفيق يوميج، أكتبيلي شغلاتج وأنا أرتبها إلج بهدوء.\nمثلاً: "عندي طبخ وتنظيف وأريد أدرس ساعتين"',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showCooking, setShowCooking] = useState(false);
  const [pending, setPending] = useState<{ toolName: string; args: Record<string, any>; preview: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { load(todayISO()); }, [load]);

  // إعادة تحميل الإعدادات عند فتح المساعد + تفعيل AI تلقائياً
  useEffect(() => {
    (async () => {
      const fresh = await SettingsRepo.getSettings();
      console.log('[DIAG] Settings:', {
        aiEnabled: fresh.aiEnabled,
        hasKey: !!fresh.aiApiKey,
        keyStart: fresh.aiApiKey?.slice(0, 12),
        model: fresh.aiModel,
      });
      if (fresh.aiApiKey?.startsWith('gsk_') && !fresh.aiEnabled) {
        console.log('[DIAG] Force-enabling AI');
        await SettingsRepo.saveSettings({ aiEnabled: true });
        await useSettings.getState().load();
      }
    })();
  }, []);
  useEffect(() => {
    isVoiceAvailable().then(setVoiceAvailable).catch(() => setVoiceAvailable(false));
  }, []);
  useEffect(() => {
    if (voiceError) {
      const t = setTimeout(() => setVoiceError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [voiceError]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || thinking) return;
    setInput('');
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text: clean };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    let finalText = '';
    let finalSuggestions: Suggestion[] | undefined;
    let source: 'ai' | 'local' = 'local';

    try {
      const reply = await runAgent({
        apiKey: settings.aiEnabled ? settings.aiApiKey : '',
        model: settings.aiModel,
        userMessage: clean,
        tasks,
        autoExecuteTools: true,
      });
      finalText = reply.text;
      source = reply.source === 'ai' ? 'ai' : reply.source === 'tool' ? 'ai' : 'local';
      if (reply.pendingConfirm) {
        setPending(reply.pendingConfirm);
      }
    } catch (e) {
      console.warn('[Agent] فشل:', e);
      const localReply = generateLocalReply(clean, tasks);
      finalText = localReply.text;
      finalSuggestions = localReply.suggestions.length > 0 ? localReply.suggestions : undefined;
      source = 'local';
    }

    setMessages(prev => [...prev, {
      id: `a_${Date.now()}`, role: 'assistant', text: finalText,
      suggestions: finalSuggestions, source,
    }]);
    setThinking(false);
  }

  async function applySuggestions(msgId: string, suggestions: Suggestion[]) {
    for (const s of suggestions) {
      await add({
        title: s.title, period: s.period, scheduledTime: s.time,
        durationMinutes: s.duration, priority: s.priority,
        completed: false, repeat: 'none', date: s.date,
      });
    }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } : m));
    setMessages(prev => [...prev, {
      id: `a_${Date.now()}`, role: 'assistant',
      text: '✅ تم! ضفت الشغلات لجدولج. روحي للصفحة الرئيسية وشوفيهن 🌷',
    }]);
  }

  async function confirmPending() {
    if (!pending) return;
    const result = await executePending(pending.toolName, pending.args);
    setMessages(prev => [...prev, {
      id: `a_${Date.now()}`, role: 'assistant',
      text: result.message, source: 'ai',
    }]);
    setPending(null);
    await load(todayISO());
  }

  async function toggleMic() {
    if (listening) {
      await stopListening();
      setListening(false);
      setPartialText('');
      return;
    }
    setVoiceError(null);
    const perm = await requestVoicePermission();
    if (!perm) {
      setVoiceError('ما عندي إذن المايك — فعّليه من إعدادات التطبيق');
      return;
    }
    setListening(true);
    setPartialText('');
    await startListening({
      onPartial: (t) => setPartialText(t),
      onResult: (t) => {
        setPartialText('');
        setListening(false);
        if (t.trim()) {
          setInput(t);
          setTimeout(() => { send(t); setInput(''); }, 200);
        }
      },
      onError: (e) => { setVoiceError(e); setListening(false); setPartialText(''); },
      onEnd: () => { setListening(false); },
    }, 'ar-IQ');
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-lavender-300 flex items-center justify-center">
          <Sparkles size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-ink-900 dark:text-rose-100">رفيق يومي 🤍</h1>
          <p className="text-xs text-rose-500 font-bold text-glow">{settings.userName ? `هلا بيج ${settings.userName} 🌸` : "شلون أقدر أساعدج اليوم؟ 🌸"}</p>
        </div>
      </div>


      <div className="space-y-3 mb-4 pb-44">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-xl3 px-4 py-3 ${
              m.role === 'user'
                ? 'bg-rose-400 text-white rounded-tl-sm'
                : 'bg-white dark:bg-[#252532] text-ink-900 dark:text-rose-100 rounded-tr-sm shadow-card'
            }`}>
              {m.role === 'assistant' && m.source && (
                <div className="flex items-center gap-1 mb-1.5 text-[10px] font-bold">
                  {m.source === 'ai'
                    ? <span className="text-lavender-300 flex items-center gap-1"><Sparkles size={10} /> رفيق</span>
                    : <span className="text-ink-300 flex items-center gap-1"><WifiOff size={10} /> محلي{getLastLocalReason() ? ` — ${getLastLocalReason()}` : ''}</span>}
                </div>
              )}
              <p className="text-sm whitespace-pre-line leading-relaxed">{formatText(m.text)}</p>
              {m.suggestions && m.suggestions.length > 0 && !m.applied && (
                <div className="mt-3 pt-3 border-t border-rose-100 dark:border-[#34343f]">
                  <button
                    onClick={() => applySuggestions(m.id, m.suggestions!)}
                    className="w-full bg-rose-400 text-white rounded-xl2 py-2.5 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> طبّقي الجدول
                  </button>
                </div>
              )}
              {m.applied && (
                <p className="mt-2 text-xs text-mint-300 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> مطبّق
                </p>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-end">
            <div className="bg-white dark:bg-[#252532] rounded-xl3 rounded-tr-sm px-4 py-3 shadow-card">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setShowPlanner(true)}
            className="card-soft py-3 px-3 active:scale-95 transition-transform text-right"
          >
            <div className="text-2xl mb-1">🌸</div>
            <p className="font-bold text-xs text-ink-900 dark:text-rose-100">رتبيلي يومي</p>
            <p className="text-[10px] text-ink-500 dark:text-rose-300/80 mt-0.5">اختيارات جاهزة</p>
          </button>
          <button
            onClick={() => setShowCooking(true)}
            className="card-soft py-3 px-3 active:scale-95 transition-transform text-right"
          >
            <div className="text-2xl mb-1">👩‍🍳</div>
            <p className="font-bold text-xs text-ink-900 dark:text-rose-100">شنو أطبخ؟</p>
            <p className="text-[10px] text-ink-500 dark:text-rose-300/80 mt-0.5">من ثلاجتج</p>
          </button>
        </div>
      )}
      

      <div className="fixed left-0 right-0 z-40 px-4" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 8px)' }}>
        {voiceError && (
          <div className="max-w-lg mx-auto mb-2 bg-rose-100 dark:bg-[#2a1f2a] border border-rose-200 rounded-xl2 px-3 py-2 text-xs text-rose-600 font-semibold text-center">
            {voiceError}
          </div>
        )}
        {listening && partialText && (
          <div className="max-w-lg mx-auto mb-2 bg-white dark:bg-[#252532] rounded-xl2 px-3 py-2 shadow-card">
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">🎙️ أسمعج...</p>
            <p className="text-sm font-semibold text-ink-900 dark:text-rose-100">{partialText}</p>
          </div>
        )}
        <div className="max-w-lg mx-auto bg-white dark:bg-[#252532] rounded-xl3 shadow-float p-2 flex items-center gap-2 border border-rose-100 dark:border-[#34343f]">
          <input type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(input); }}
            placeholder={listening ? 'تكلمي...' : 'اكتبيلي شنو عندج اليوم...'}
            className="flex-1 px-3 py-2 bg-transparent text-ink-900 dark:text-rose-100 outline-none text-sm"
          />
          {voiceAvailable && (
            <button onClick={toggleMic} disabled={thinking}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                listening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-rose-100 dark:bg-[#34343f] text-rose-500'
              }`}>
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <button onClick={() => send(input)} disabled={!input.trim() || thinking}
            className="w-10 h-10 rounded-full bg-rose-400 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform shrink-0">
            <Send size={18} />
          </button>
        </div>
      </div>
      {pending && (
        <div className="fixed inset-x-4 bottom-36 z-40 max-w-lg mx-auto bg-white dark:bg-[#252532] rounded-xl3 shadow-float p-4 border-2 border-rose-300">
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">تأكيد العملية:</p>
          <p className="text-sm font-bold text-ink-900 dark:text-rose-100 mb-3">{pending.preview}</p>
          <div className="flex gap-2">
            <button onClick={() => setPending(null)} className="flex-1 py-2 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold text-sm">
              إلغاء
            </button>
            <button onClick={confirmPending} className="flex-1 btn-primary text-sm">
              تنفيذ
            </button>
          </div>
        </div>
      )}

      {showPlanner && (
        <DayPlannerModal
          apiKey={settings.aiEnabled ? settings.aiApiKey : undefined}
          model={settings.aiModel}
          onClose={() => setShowPlanner(false)}
          onApply={async (plannedTasks) => {
            console.log('[onApply] محاولة إضافة', plannedTasks.length, 'مهام');
            const today = todayISO();
            const results = await Promise.allSettled(
              plannedTasks.map(t => add({
                title: t.title,
                period: t.period,
                scheduledTime: t.time,
                durationMinutes: t.duration,
                priority: 'medium',
                completed: false,
                repeat: 'none',
                date: today,
              }))
            );
            const okCount = results.filter(r => r.status === 'fulfilled').length;
            const failCount = results.length - okCount;
            console.log('[onApply] نجحت', okCount, 'فشلت', failCount);
            if (failCount > 0) {
              results.forEach((r, i) => {
                if (r.status === 'rejected') console.error('[onApply] فشلت:', plannedTasks[i].title, r.reason);
              });
            }
            await useTasks.getState().load(today);
            setMessages(prev => [...prev, {
              id: `a_${Date.now()}`, role: 'assistant',
              text: failCount === 0
                ? `✅ ضفت ${okCount} شغلة لجدولج 🌸`
                : `⚠️ ضفت ${okCount} شغلة، ${failCount} فشلت`,
              source: 'ai',
            }]);
          }}
        />
      )}

      {showCooking && (
        <CookingModal
          apiKey={settings.aiEnabled ? settings.aiApiKey : undefined}
          model={settings.aiModel}
          onClose={() => setShowCooking(false)}
          onSave={(cook) => {
            const stepsText = cook.steps.map((st, i) => `${i + 1}. ${st}`).join('\n');
            const text = `🍳 اقتراح الأكلة: **${cook.dish}** ${cook.emoji}\n\n` +
              `⏱️ تحضير ${cook.prepTime} د · 🔥 طبخ ${cook.cookTime} د\n\n` +
              `🎯 من اللي عندج: ${cook.ingredientsUsed.join(' · ')}\n\n` +
              `📝 الخطوات:\n${stepsText}`;
            setMessages(prev => [...prev, {
              id: `cook_${Date.now()}`,
              role: 'assistant',
              text,
              source: cook.source === 'ai' ? 'ai' : 'local',
            }]);
          }}
        />
      )}
    </Layout>
  );
}
