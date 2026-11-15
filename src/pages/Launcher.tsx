import { useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import { Smartphone, Home, Palette, Grid3X3, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';

interface YawmiLauncherPlugin {
  openLauncher(): Promise<void>;
  openHomeSettings(): Promise<void>;
}

const Launcher = registerPlugin<YawmiLauncherPlugin>('YawmiLauncher');

export default function LauncherPage() {
  const [loading, setLoading] = useState('');

  const run = async (action: 'openLauncher' | 'openHomeSettings') => {
    setLoading(action);
    try {
      await Launcher[action]();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'تعذر تنفيذ العملية');
    } finally {
      setLoading('');
    }
  };

  return (
    <Layout>
      <div dir="rtl" className="space-y-5">
        <header className="text-center pt-3">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-lg">
            <Smartphone size={38} />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">
            لانشر جهازي
          </h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-rose-200/70">
            خلي شاشة جهازك على ذوقك مع يومي حلو
          </p>
        </header>

        <section className="rounded-3xl border border-rose-100 dark:border-[#393342] bg-white dark:bg-[#252532] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/15 p-3 text-rose-500">
              <Home size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-ink-900 dark:text-rose-100">شاشة يومي حلو الرئيسية</h2>
              <p className="text-xs text-ink-500 dark:text-rose-200/70">افتح واجهة اللانشر الأصلية</p>
            </div>
          </div>
          <button
            onClick={() => run('openLauncher')}
            disabled={!!loading}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-4 font-bold text-white shadow-md disabled:opacity-50"
          >
            {loading === 'openLauncher' ? 'جاري الفتح...' : 'فتح اللانشر'}
          </button>
        </section>

        <section className="rounded-3xl border border-rose-100 dark:border-[#393342] bg-white dark:bg-[#252532] p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-2xl bg-purple-50 dark:bg-purple-500/15 p-3 text-purple-500">
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className="font-extrabold text-ink-900 dark:text-rose-100">تفعيل لانشر الجهاز</h2>
              <p className="text-xs text-ink-500 dark:text-rose-200/70">اختيار يومي حلو كشاشة رئيسية افتراضية</p>
            </div>
          </div>
          <button
            onClick={() => run('openHomeSettings')}
            disabled={!!loading}
            className="w-full rounded-2xl border-2 border-rose-200 dark:border-rose-400/30 py-4 font-bold text-rose-600 dark:text-rose-300 disabled:opacity-50"
          >
            {loading === 'openHomeSettings' ? 'جاري الفتح...' : 'اختيار اللانشر الافتراضي'}
            <ArrowUpRight className="mr-2 inline" size={17} />
          </button>
          <p className="mt-3 text-xs leading-6 text-ink-500 dark:text-rose-200/70">
            بعد فتح إعدادات أندرويد، اختَر «يومي حلو» كتطبيق الشاشة الرئيسية. تقدر ترجع للانشر السابق من نفس الإعدادات.
          </p>
        </section>

        <section className="rounded-3xl bg-rose-50 dark:bg-[#302633] p-5">
          <h2 className="mb-3 flex items-center gap-2 font-extrabold text-ink-900 dark:text-rose-100">
            <Palette size={20} className="text-rose-500" />
            تخصيص شكل التطبيقات
          </h2>
          <div className="flex items-center gap-3 text-sm text-ink-600 dark:text-rose-200/80">
            <Grid3X3 size={22} className="shrink-0 text-rose-500" />
            <p>المرحلة القادمة: أشكال موحّدة للأيقونات، أحجام مختلفة، ألوان وخلفيات، وتخصيص مستقل لكل تطبيق.</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
