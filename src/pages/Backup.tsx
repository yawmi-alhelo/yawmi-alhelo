import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Upload, AlertCircle, CheckCircle2, FileJson } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import Layout from '../components/Layout';
import { createBackup, restoreBackup, backupFilename, type BackupData } from '../lib/backup';

export default function Backup() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true); setStatus(null);
    try {
      const data = await createBackup();
      const json = JSON.stringify(data, null, 2);
      const filename = backupFilename();

      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: 'يومي الحلو — نسخة احتياطية',
          url: result.uri,
          dialogTitle: 'احفظي أو شاركي النسخة',
        });
        setStatus({ type: 'ok', msg: '✅ تم إنشاء النسخة — احفظيها بمكان آمن' });
      } else {
        // Web: تنزيل مباشر
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
        setStatus({ type: 'ok', msg: '✅ تم تنزيل الملف' });
      }
    } catch (e) {
      console.error(e);
      setStatus({ type: 'err', msg: '❌ صار خطأ أثناء التصدير' });
    }
    setBusy(false);
  }

  async function handleImport(file: File) {
    if (!confirm('⚠️ استيراد نسخة سيحذف كل البيانات الحالية ويستبدلها. متأكدة؟')) return;
    setBusy(true); setStatus(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;
      await restoreBackup(data);
      setStatus({ type: 'ok', msg: '✅ تم استيراد البيانات بنجاح — أعدي تشغيل التطبيق' });
    } catch (e) {
      console.error(e);
      setStatus({ type: 'err', msg: '❌ فشل الاستيراد — تأكدي إنه ملف JSON صحيح' });
    }
    setBusy(false);
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">النسخ الاحتياطي 💾</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-0.5">احفظي بياناتج بمكان آمن</p>
        </div>
      </div>

      {status && (
        <div className={`mb-4 p-3 rounded-xl2 flex items-center gap-2 ${
          status.type === 'ok'
            ? 'bg-mint-100 dark:bg-[#1f2a25] text-mint-300 border border-mint-200'
            : 'bg-rose-100 dark:bg-[#2a1f2a] text-rose-600 border border-rose-200'
        }`}>
          {status.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-semibold">{status.msg}</span>
        </div>
      )}

      <div className="card-soft mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Download size={20} className="text-rose-500" />
          <h2 className="font-bold text-ink-900 dark:text-rose-100">تصدير النسخة</h2>
        </div>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-4">
          يحفظ كل البيانات في ملف JSON — المهام، المواعيد، العادات، الملاحظات، الإعدادات، إلخ.
        </p>
        <button onClick={handleExport} disabled={busy} className="w-full btn-primary disabled:opacity-50">
          {busy ? 'جاري...' : 'حفظ نسخة احتياطية'}
        </button>
      </div>

      <div className="card-soft mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Upload size={20} className="text-lavender-300" />
          <h2 className="font-bold text-ink-900 dark:text-rose-100">استيراد نسخة</h2>
        </div>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-4">
          ⚠️ الاستيراد سيمسح كل البيانات الحالية ويستبدلها بالنسخة المرفوعة.
        </p>
        <input
          ref={fileRef} type="file" accept="application/json"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); }}
          className="hidden"
        />
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full btn-secondary disabled:opacity-50">
          {busy ? 'جاري...' : 'اختيار ملف النسخة'}
        </button>
      </div>

      <div className="card-soft bg-lavender-100 dark:bg-[#2a2535] border border-lavender-200 dark:border-[#3a3545]">
        <div className="flex items-start gap-2">
          <FileJson size={18} className="text-lavender-300 shrink-0 mt-0.5" />
          <div className="text-xs text-ink-700 dark:text-rose-200 leading-relaxed">
            <p className="font-bold mb-1">💡 نصيحة</p>
            <p>احفظي النسخة بمكان آمن (Google Drive، إيميلج، أو أي تطبيق تخزين) — هذا الملف هو النسخة الكاملة من كل بياناتج.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
