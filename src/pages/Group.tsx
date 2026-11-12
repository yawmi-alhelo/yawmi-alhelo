import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Plus, LogIn, Copy, Check,
  Crown, Trophy, Flame, LogOut, Loader2,
  Send, MessageCircle, Users
} from 'lucide-react';
import Layout from '../components/Layout';
import { useSettings } from '../stores/useSettings';
import { useRewards } from '../stores/useRewards';
import {
  generateDeviceId, createRoom, joinRoom,
  getRoomMembers, subscribeToRoom, leaveRoom,
  sendMessage, getMessages, subscribeToMessages,
  type RoomMember, type ChatMessage,
} from '../lib/group';
import { notifyGroupMessage } from '../lib/notifications';
import { getLevelTier } from '../lib/rewards/levels';

export default function Group() {
  const nav = useNavigate();
  const { settings, update } = useSettings();
  const { state: rewards } = useRewards();

  const [mode, setMode] = useState<'view' | 'create' | 'join'>(
    settings.groupId ? 'view' : 'view'
  );
  const [nickname, setNickname] = useState(settings.nickname || '');
  const [joinCode, setJoinCode] = useState('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'members' | 'chat'>('members');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const deviceId = settings.deviceId || (() => {
    const id = generateDeviceId();
    update({ deviceId: id });
    return id;
  })();

  const myStats = {
    level: Math.floor(rewards.points / 100) + 1,
    points: rewards.points,
    streak: rewards.streak || 0,
    flowers: rewards.flowers,
  };

  const loadMembers = useCallback(async () => {
    if (!settings.groupId) return;
    try {
      const m = await getRoomMembers(settings.groupId);
      setMembers(m);
    } catch (e: any) {
      console.warn('[Group] فشل تحميل الأعضاء:', e?.message);
    }
  }, [settings.groupId]);

  const loadChat = useCallback(async () => {
    if (!settings.groupId) return;
    const m = await getMessages(settings.groupId);
    // إشعار لآخر رسالة إذا مو مني
    const lastMsg = m[m.length - 1];
    const prevLast = messages[messages.length - 1];
    if (lastMsg && lastMsg.device_id !== deviceId && (!prevLast || prevLast.id !== lastMsg.id)) {
      if (settings.notificationsEnabled) {
        notifyGroupMessage(lastMsg.nickname, lastMsg.text);
      }
    }
    setMessages(m);
  }, [settings.groupId, deviceId, messages, settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.groupId || tab !== 'chat') return;
    loadChat();
    const unsub = subscribeToMessages(settings.groupId, loadChat);
    const interval = setInterval(loadChat, 5000);
    return () => { unsub(); clearInterval(interval); };
  }, [settings.groupId, tab, loadChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!settings.groupId) return;
    loadMembers();
    const unsub = subscribeToRoom(settings.groupId, loadMembers);
    // تحديث كل 30 ثانية كاحتياط
    const interval = setInterval(loadMembers, 30000);
    return () => { unsub(); clearInterval(interval); };
  }, [settings.groupId, loadMembers]);

  async function handleCreate() {
    if (!nickname.trim()) { setError('اكتبي اسمج'); return; }
    setLoading(true); setError('');
    try {
      const room = await createRoom(nickname.trim(), deviceId, myStats);
      await update({
        groupId: room.roomId,
        groupCode: room.code,
        groupName: room.name,
        nickname: room.finalNickname,
        deviceId,
      });
      setMode('view');
    } catch (e: any) {
      setError(e?.message || 'فشل الإنشاء');
    } finally { setLoading(false); }
  }

  async function handleJoin() {
    if (!nickname.trim()) { setError('اكتبي اسمج'); return; }
    if (!joinCode.trim()) { setError('اكتبي كود المجموعة'); return; }
    setLoading(true); setError('');
    try {
      const room = await joinRoom(joinCode.trim(), nickname.trim(), deviceId, myStats);
      // لو الاسم تغيّر تلقائياً (لأنه مكرر)
      const finalName = room.finalNickname || nickname.trim();
      if (finalName !== nickname.trim()) {
        setError(`⚠️ "${nickname.trim()}" موجود — انضميتي باسم "${finalName}"`);
      }
      await update({
        groupId: room.roomId,
        groupCode: room.code,
        groupName: room.name,
        nickname: finalName,
        deviceId,
      });
      setMode('view');
    } catch (e: any) {
      setError(e?.message || 'فشل الانضمام');
    } finally { setLoading(false); }
  }

  async function handleLeave() {
    if (!confirm('متأكدة تريدين تطلعين من المجموعة؟')) return;
    try {
      await leaveRoom(settings.groupId, deviceId);
    } catch {}
    await update({ groupId: '', groupCode: '', groupName: '' });
    setMembers([]);
  }

  async function handleSend() {
    if (!messageText.trim() || !settings.groupId) return;
    setSending(true);
    try {
      await sendMessage(settings.groupId, deviceId, settings.nickname || 'أنا', messageText.trim());
      setMessageText('');
      await loadChat();
    } catch (e: any) {
      console.warn('[chat] فشل:', e?.message);
    } finally {
      setSending(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(settings.groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">مجموعتنا 👥</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-0.5">
            {settings.groupId ? 'تابعي تقدم الكل' : 'انضمي أو أنشئي مجموعة'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded-xl2 bg-rose-100 dark:bg-[#2a1f2a] border border-rose-200 text-rose-600 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ما في مجموعة */}
      {!settings.groupId && mode === 'view' && (
        <div className="space-y-3">
          <button
            onClick={() => setMode('create')}
            className="card-soft w-full text-right active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-lavender-300 flex items-center justify-center">
                <Plus size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-ink-900 dark:text-rose-100">أنشئي مجموعة</p>
                <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">
                  إنتي الأولى — بعدين شاركي الكود
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('join')}
            className="card-soft w-full text-right active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lavender-300 to-mint-300 flex items-center justify-center">
                <LogIn size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-ink-900 dark:text-rose-100">انضمي لمجموعة</p>
                <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">
                  عندج كود من صاحبتج؟
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* نموذج الإنشاء أو الانضمام */}
      {(mode === 'create' || mode === 'join') && !settings.groupId && (
        <div className="card-soft">
          <p className="font-bold text-ink-900 dark:text-rose-100 mb-3">
            {mode === 'create' ? '🌸 مجموعة جديدة' : '🔑 انضمام'}
          </p>

          <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">
            اسمج (nickname)
          </label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="مثلاً: قمرة، وردة..."
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 mb-3"
          />

          {mode === 'join' && (
            <>
              <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">
                كود المجموعة
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="A8K3X9"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 mb-3 font-mono text-center text-xl tracking-widest"
              />
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setMode('view'); setError(''); }}
              className="px-4 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold"
            >
              إلغاء
            </button>
            <button
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> جاري...</>
                : mode === 'create' ? 'أنشئي' : 'انضمي'}
            </button>
          </div>
        </div>
      )}

      {/* عرض المجموعة */}
      {settings.groupId && (
        <>
          {/* كود المشاركة */}
          <div className="card-soft mb-4 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.15) 0%, rgba(184,164,236,0.15) 100%)' }}>
            <p className="text-xs font-bold text-rose-500 mb-2">كود المجموعة</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-extrabold text-ink-900 dark:text-rose-100 font-mono tracking-widest">
                {settings.groupCode}
              </p>
              <button
                onClick={copyCode}
                className="p-2 rounded-full bg-white dark:bg-[#252532] text-rose-500 active:scale-95"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-2">
              شاركي هذا الكود مع صاحباتج للانضمام
            </p>
          </div>

          {/* تبويبات */}
          <div className="flex gap-1 mb-3 p-1 rounded-xl2 bg-rose-100 dark:bg-[#1a1a24]">
            <button
              onClick={() => setTab('members')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                tab === 'members' ? 'bg-white dark:bg-[#252532] text-rose-500 shadow' : 'text-ink-500 dark:text-rose-300/80'
              }`}
            >
              <Users size={14} /> الأعضاء ({members.length})
            </button>
            <button
              onClick={() => setTab('chat')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                tab === 'chat' ? 'bg-white dark:bg-[#252532] text-rose-500 shadow' : 'text-ink-500 dark:text-rose-300/80'
              }`}
            >
              <MessageCircle size={14} /> المحادثة
            </button>
          </div>

          {tab === 'members' && (
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80">الأعضاء</h2>
            <button onClick={handleLeave} className="text-xs font-bold text-rose-500 flex items-center gap-1">
              <LogOut size={12} /> اطلعي
            </button>
          </div>
          )}

          {tab === 'members' && (
          <div className="space-y-2 mb-4">
            {members.map((m, idx) => {
              const isMe = m.device_id === deviceId;
              return (
                <div
                  key={m.id}
                  className={`card-soft flex items-center gap-3 ${isMe ? 'border-2 border-rose-300' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg ${
                    idx === 0 ? 'bg-gradient-to-br from-peach-200 to-peach-300 text-white'
                    : idx === 1 ? 'bg-gradient-to-br from-lavender-200 to-lavender-300 text-white'
                    : idx === 2 ? 'bg-gradient-to-br from-mint-200 to-mint-300 text-white'
                    : 'bg-rose-100 dark:bg-[#34343f] text-rose-500'
                  }`}>
                    {idx === 0 ? <Crown size={18} /> : m.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink-900 dark:text-rose-100 text-sm flex items-center gap-1">
                      <span>{getLevelTier(m.points).emoji}</span>
                      <span>{m.nickname}</span>
                      {isMe && <span className="text-xs text-rose-400">(إنتي)</span>}
                    </p>
                    {m.title && <p className="text-[10px] font-bold text-peach-300">🏅 {m.title}</p>}
                    <div className="flex flex-wrap gap-2 text-[10px] text-ink-500 dark:text-rose-300/80 mt-1">
                      <span className="flex items-center gap-0.5"><Trophy size={10} /> مستوى {m.level}</span>
                      <span className="flex items-center gap-0.5"><Flame size={10} /> {m.streak} يوم</span>
                      <span className="flex items-center gap-0.5">🌷 {m.flowers}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-extrabold text-rose-500">{m.points}</p>
                    <p className="text-[9px] text-ink-500 dark:text-rose-300/80">نقطة</p>
                  </div>
                </div>
              );
            })}
            {members.length === 0 && (
              <div className="card-soft text-center py-6 text-sm text-ink-500 dark:text-rose-300/80">
                <Loader2 size={20} className="mx-auto animate-spin mb-2 text-rose-400" />
                جاري التحميل...
              </div>
            )}
          </div>
          )}

          {tab === 'chat' && (
          <>
            <div className="card-soft mb-2 chat-scroll-area" style={{ minHeight: '320px', maxHeight: '55vh' }}>
              {messages.length === 0 ? (
                <div className="text-center py-12 text-sm text-ink-500 dark:text-rose-300/80">
                  <MessageCircle size={40} className="mx-auto mb-3 text-rose-300" />
                  <p>ما في رسائل بعد</p>
                  <p className="text-xs mt-1">كوني أول من يكتب 💬</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map(m => {
                    const isMe = m.device_id === deviceId;
                    const senderPoints = members.find(x => x.device_id === m.device_id)?.points || 0;
                    const tier = getLevelTier(senderPoints);
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-xl3 px-3 py-2 ${
                          isMe
                            ? 'bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-tl-sm'
                            : `${tier.chatBubble} ${tier.chatText} rounded-tr-sm border ${tier.border}`
                        }`}>
                          {!isMe && (
                            <p className="text-[10px] font-bold opacity-80 mb-0.5">
                              {tier.emoji} {m.nickname}
                              {members.find(x => x.device_id === m.device_id)?.title && ` 🏅 ${members.find(x => x.device_id === m.device_id)?.title}`}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-line break-words">{m.text}</p>
                          <p className={`text-[9px] mt-1 ${isMe ? 'text-white/70' : 'opacity-60'}`}>
                            {new Date(m.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="اكتبي رسالة..."
                className="flex-1 px-3 py-3 rounded-xl2 bg-white dark:bg-[#252532] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 text-sm"
                maxLength={500}
              />
              <button
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                className="w-12 h-12 rounded-xl2 bg-rose-400 text-white flex items-center justify-center disabled:opacity-40 active:scale-95"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </>
          )}
        </>
      )}

      {/* معلومة */}
      <div className="card-soft bg-lavender-100 dark:bg-[#2a2535] border border-lavender-200 dark:border-[#3a3545]">
        <p className="text-xs text-ink-700 dark:text-rose-200 leading-relaxed">
          <strong>💡 الخصوصية:</strong> بس المستوى والنقاط والستريك والزهور يشوفهن الباقي.
          مهامك، مواعيدك، ملاحظاتك — <strong>كلها خاصة بيج</strong> ولا أحد يشوفها.
        </p>
      </div>
    </Layout>
  );
}
