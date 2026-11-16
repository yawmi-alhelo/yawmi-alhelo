import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useSettings } from '../stores/useSettings';
import { SOUNDS } from '../lib/sounds';
import { notifyNow } from '../lib/notifications';

export default function Sounds() {
  const nav = useNavigate();
  const { settings, update } = useSettings();
  const [testing, setTesting] = useState<string | null>(null);

  async function test(id: string) {
    setTesting(id);
    await notifyNow('🔔 تجربة النغمة', 'هيك راح يظهر تنبيهج', id);
    setTimeout(() => setTesting(null), 1200);
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">الأصوات 🎵</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-0.5">اختاري النغمة اللي تحبينها</p>
        </div>
      </div>

      <SoundSection
        title="نغمة التذكير بالمهام"
        field="notificationSound"
        current={settings.notificationSound}
        onSelect={(id) => update({ notificationSound: id })}
        onTest={test}
        testing={testing}
      />

      <SoundSection
        title="نغمة إتمام المهمة"
        field="completeSound"
        current={settings.completeSound}
        onSelect={(id) => update({ completeSound: id })}
        onTest={test}
        testing={testing}
      />

      <SoundSection
        title="نغمة الاستراحة"
        field="breakSound"
        current={settings.breakSound}
        onSelect={(id) => update({ breakSound: id })}
        onTest={test}
        testing={testing}
      />

      <div className="card-soft mt-6 text-center text-sm text-ink-500 dark:text-rose-300/80">
        <p>💡 زر التجربة يرسل إشعار حقيقي — إذا ما سمعتي صوت، تأكدي إن الإشعارات مفعّلة</p>
      </div>
    </Layout>
  );
}

function SoundSection({ title, current, onSelect, onTest, testing }: {
  title: string;
  field: string;
  current: string;
  onSelect: (id: string) => void;
  onTest: (id: string) => void;
  testing: string | null;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1">{title}</h2>
      <div className="card-soft divide-y divide-rose-50 dark:divide-[#34343f] p-0 overflow-hidden">
        {SOUNDS.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3.5">
            <button
              onClick={() => onSelect(s.id)}
              className="flex-1 flex items-center gap-3 text-right"
            >
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                {current === s.id
                  ? <CheckCircle2 size={22} className="text-rose-500" />
                  : <div className="w-5 h-5 rounded-full border-2 border-rose-200" />}
              </div>
              <span className={`text-sm ${current === s.id ? 'font-bold text-ink-900 dark:text-rose-100' : 'text-ink-700 dark:text-rose-200'}`}>
                {s.nameAr}
              </span>
            </button>
            <button
              onClick={() => onTest(s.id)}
              disabled={testing === s.id}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                testing === s.id
                  ? 'bg-mint-300 text-white animate-pulse'
                  : 'bg-rose-100 dark:bg-[#34343f] text-rose-500'
              }`}
            >
              <Play size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
