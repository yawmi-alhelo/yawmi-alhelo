import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const stamp = Date.now();
const backupDir = `.repair-backup-${stamp}`;
fs.mkdirSync(backupDir, { recursive: true });

const files = [
  'src/App.tsx',
  'src/stores/useAppointments.ts',
  'src/lib/tools/appointments.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`ملف أساسي غير موجود: ${file}`);
    process.exit(1);
  }
  const dest = path.join(backupDir, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes("const Favorites = lazy(() => import('./pages/Favorites'));")) {
  console.error('تعذر تحديد مكان إضافة صفحة المواعيد في App.tsx');
  process.exit(1);
}

if (!app.includes("const AppointmentsPage = lazy(() => import('./pages/Appointments'));")) {
  app = app.replace(
    "const Favorites = lazy(() => import('./pages/Favorites'));",
    "const Favorites = lazy(() => import('./pages/Favorites'));\nconst AppointmentsPage = lazy(() => import('./pages/Appointments'));"
  );
}

if (!app.includes('<Route path="/appointments" element={<Placeholder title="المواعيد" />} />')) {
  console.error('مسار المواعيد تغيّر؛ أوقفت التعديل لحماية الملف.');
  process.exit(1);
}

app = app.replace(
  '<Route path="/appointments" element={<Placeholder title="المواعيد" />} />',
  '<Route path="/appointments" element={<AppointmentsPage />} />'
);
fs.writeFileSync(appPath, app);

const store = `import { create } from 'zustand';
import { Appointments as Repo } from '../lib/repositories';
import { scheduleAppointmentReminder, cancelAppointmentReminder } from '../lib/notifications';
import { useSettings } from './useSettings';
import type { Appointment } from '../types';

interface State {
  items: Appointment[];
  loading: boolean;
  load: () => Promise<void>;
  add: (input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, patch: Partial<Appointment>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAppointments = create<State>((set, get) => ({
  items: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const items = await Repo.getAllAppointments();
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const appt = await Repo.addAppointment(input);
    const settings = useSettings.getState().settings;

    if (settings.notificationsEnabled && appt.reminderMinutes > 0) {
      try {
        await scheduleAppointmentReminder(appt, settings.notificationSound);
      } catch (error) {
        console.error('Appointment reminder scheduling failed:', error);
      }
    }

    await get().load();
  },

  update: async (id, patch) => {
    const updated = await Repo.updateAppointment(id, patch);

    if (!updated) {
      await get().load();
      return;
    }

    try {
      await cancelAppointmentReminder(id);
    } catch (error) {
      console.error('Appointment reminder cancellation failed:', error);
    }

    const settings = useSettings.getState().settings;
    if (settings.notificationsEnabled && updated.reminderMinutes > 0) {
      try {
        await scheduleAppointmentReminder(updated, settings.notificationSound);
      } catch (error) {
        console.error('Appointment reminder rescheduling failed:', error);
      }
    }

    await get().load();
  },

  remove: async (id) => {
    await Repo.deleteAppointment(id);

    try {
      await cancelAppointmentReminder(id);
    } catch (error) {
      console.error('Appointment reminder cancellation failed:', error);
    }

    await get().load();
  },
}));
`;
fs.writeFileSync('src/stores/useAppointments.ts', store);

const toolPath = 'src/lib/tools/appointments.ts';
let tool = fs.readFileSync(toolPath, 'utf8');

const oldReminder = "reminderMinutes: args.reminderMinutes ? parseInt(args.reminderMinutes) : 15,";
if (!tool.includes(oldReminder)) {
  console.error('تعذر العثور على سطر reminderMinutes؛ أوقفت التعديل.');
  process.exit(1);
}
tool = tool.replace(
  oldReminder,
  "reminderMinutes: args.reminderMinutes !== undefined && args.reminderMinutes !== null ? Number(args.reminderMinutes) : 15,"
);
fs.writeFileSync(toolPath, tool);

const pagePath = 'src/pages/Appointments.tsx';
if (fs.existsSync(pagePath)) {
  const dest = path.join(backupDir, pagePath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(pagePath, dest);
}

const page = `import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Plus, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import AppointmentForm from '../components/AppointmentForm';
import { useAppointments } from '../stores/useAppointments';
import { todayISO, formatTimeAr } from '../lib/date';
import type { Appointment } from '../types';

type AppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;

export default function Appointments() {
  const { items, loading, load, add, update, remove } = useAppointments();
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void load().catch((err) => {
      console.error('Appointments load failed:', err);
      setError('تعذر تحميل المواعيد. حاولي تحديث الصفحة.');
    });
  }, [load]);

  const sorted = useMemo(
    () => [...items].sort((a, b) =>
      (a.date + 'T' + a.time).localeCompare(b.date + 'T' + b.time)
    ),
    [items]
  );

  const today = todayISO();
  const todayItems = sorted.filter(item => item.date === today);
  const upcoming = sorted.filter(item => item.date > today);
  const previous = sorted.filter(item => item.date < today);

  async function handleSave(data: AppointmentInput) {
    setError('');
    try {
      if (editing) {
        await update(editing.id, data);
      } else {
        await add(data);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error('Appointment save failed:', err);
      setError('ما قدرنا نحفظ الموعد. تأكدي من البيانات وحاولي مرة ثانية.');
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm('متأكد تريد حذف هذا الموعد؟')) return;

    setError('');
    try {
      await remove(editing.id);
      setEditing(null);
      setShowForm(false);
    } catch (err) {
      console.error('Appointment delete failed:', err);
      setError('تعذر حذف الموعد. حاولي مرة ثانية.');
    }
  }

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function renderSection(title: string, list: Appointment[], emoji: string) {
    return (
      <section className="mb-6">
        <h2 className="font-extrabold text-ink-800 dark:text-rose-100 mb-3 flex items-center gap-2">
          <span>{emoji}</span>{title}
          <span className="text-xs text-ink-400 font-semibold">({list.length})</span>
        </h2>
        {list.length === 0 ? (
          <div className="card-soft text-center py-5 text-sm text-ink-400">
            ماكو مواعيد بهذا القسم
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(item => (
              <article key={item.id} className="card-soft">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-[#34343f] flex items-center justify-center text-xl shrink-0">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink-900 dark:text-rose-100 break-words">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-ink-500 dark:text-rose-300/80">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />{item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />{formatTimeAr(item.time)}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />{item.location}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-2 whitespace-pre-wrap">
                        {item.notes}
                      </p>
                    )}
                    <p className="text-[11px] text-rose-400 mt-2">
                      {item.reminderMinutes > 0
                        ? '🔔 تذكير قبل ' + item.reminderMinutes + ' دقيقة'
                        : '🔕 بدون تذكير'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditing(item); setShowForm(true); }}
                    aria-label="تعديل الموعد"
                    className="p-2 rounded-xl bg-rose-50 dark:bg-[#34343f] text-rose-500"
                  >
                    <Pencil size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]"
            aria-label="رجوع"
          >
            <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">المواعيد</h1>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">
              رتّبي مواعيدج وخلي تذكيراتج تساعدج 🌷
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          aria-label="إضافة موعد"
          className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95"
        >
          <Plus size={21} />
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-100 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="card-soft text-center py-10 text-rose-500">جاري تحميل المواعيد...</div>
      ) : sorted.length === 0 ? (
        <div className="card-soft text-center py-12">
          <p className="text-5xl mb-3">🗓️</p>
          <p className="font-bold text-ink-800 dark:text-rose-100 mb-2">ما عندج مواعيد حالياً</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-4">ضيفي أول موعد حتى نذكّرج بيه</p>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> إضافة موعد
          </button>
        </div>
      ) : (
        <>
          {renderSection('مواعيد اليوم', todayItems, '🌸')}
          {renderSection('المواعيد القادمة', upcoming, '✨')}
          {renderSection('المواعيد السابقة', previous, '📚')}
        </>
      )}

      {showForm && (
        <AppointmentForm
          initial={editing || undefined}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </Layout>
  );
}
`;
fs.writeFileSync(pagePath, page);

console.log('تم تطبيق إصلاحات المواعيد وربط الصفحة.');
console.log(`النسخ الاحتياطية: ${backupDir}`);

const commands = [
  ['TypeScript', 'npx', ['tsc', '--noEmit']],
  ['ESLint', 'npm', ['run', 'lint']],
  ['Production Build', 'npm', ['run', 'build']]
];

let report = '';
let failed = false;

for (const [label, command, args] of commands) {
  console.log(`\n========== ${label} ==========`);
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 8 * 1024 * 1024
  });

  const output = (result.stdout || '') + (result.stderr || '');
  report += `\n========== ${label} ==========\n${output}\n`;
  if (output) process.stdout.write(output);

  if (result.error || result.status !== 0) {
    failed = true;
    const message = result.error?.message || `Exit code: ${result.status}`;
    console.log(`❌ فشل ${label}: ${message}`);
    report += `❌ فشل ${label}: ${message}\n`;
  } else {
    console.log(`✅ نجح ${label}`);
  }
}

report += `\nالنسخة الاحتياطية: ${backupDir}\n`;
report += failed
  ? '\nالنتيجة: توجد فحوصات فاشلة وتحتاج معالجة.\n'
  : '\nالنتيجة: نجحت فحوصات TypeScript وLint وBuild.\n';

const reportPath = path.join(process.env.HOME || '.', 'yawmi-repair-report.txt');
fs.writeFileSync(reportPath, report);

console.log('\n========== النتيجة النهائية ==========');
console.log(failed ? '⚠️ الإصلاحات طُبقت لكن بعض الفحوصات فشلت.' : '✅ الإصلاحات طُبقت والفحوصات الثلاثة نجحت.');
console.log(`التقرير: ${reportPath}`);

const clipboard = spawnSync('termux-clipboard-set', [], {
  input: report,
  encoding: 'utf8',
  timeout: 5000
});

if (!clipboard.error && clipboard.status === 0) {
  console.log('✅ تم نسخ تقرير الإصلاح إلى الحافظة.');
} else {
  console.log('⚠️ تعذر النسخ التلقائي. التقرير محفوظ بالمسار أعلاه.');
}
