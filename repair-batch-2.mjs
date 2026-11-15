import fs from 'node:fs';

const file = 'src/App.tsx';
let src = fs.readFileSync(file, 'utf8');
const original = src;

function stop(message) {
  console.error('❌ ' + message);
  process.exit(1);
}

// 1. تجهيز lazy و Suspense
if (!src.includes("from 'react'")) stop('استيراد React غير موجود');

src = src.replace(
  /import\s*\{\s*useEffect\s*,\s*useState\s*\}\s*from\s*['"]react['"];?/,
  "import { lazy, Suspense, useEffect, useState } from 'react';"
);

if (!src.includes('lazy, Suspense')) {
  stop('تعذر تجهيز lazy و Suspense');
}

// 2. تحويل صفحات التطبيق إلى تحميل عند الطلب
const pageImports = [];
src = src.replace(
  /^import\s+(\w+)\s+from\s+['"](\.\/pages\/[^'"]+)['"];?\s*$/gm,
  (match, name, path) => {
    if (name === 'Placeholder') return match;
    pageImports.push(`const ${name} = lazy(() => import('${path}'));`);
    return '';
  }
);

if (!pageImports.some(x => x.includes('const Home = lazy'))) {
  stop('لم يتم العثور على استيراد الصفحات المتوقع');
}

const reactImport = "import { lazy, Suspense, useEffect, useState } from 'react';";
src = src.replace(
  reactImport,
  reactImport + '\n\n' + pageImports.join('\n')
);

// 3. وضع Routes داخل Suspense
if (!src.includes('<Suspense')) {
  if (!src.includes('      <Routes>') || !src.includes('      </Routes>')) {
    stop('تعذر العثور على Routes');
  }

  src = src.replace(
    '      <Routes>',
    `      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">جاري تحميل الصفحة...</div>}>
        <Routes>`
  );

  src = src.replace(
    '      </Routes>',
    `        </Routes>
      </Suspense>`
  );
}

// 4. إصلاح تنظيف مؤقت المزامنة في useEffect
const effectPattern =
  /  useEffect\(\(\) => \{\s*registerAndSync\(\)\.then\(async r => \{[\s\S]*?\n  \}, \[\]\);/;

const effectReplacement = `  useEffect(() => {
    let cancelled = false;
    let syncInterval: number | undefined;

    void registerAndSync().then(async r => {
      if (cancelled) return;

      if (r.overrideApplied) {
        await useRewards.getState().load();
      }

      if (cancelled) return;

      const settings = useSettings.getState().settings;

      if (settings.syncUsername && settings.syncPassword) {
        void saveBackupToCloud(settings.syncUsername, settings.syncPassword);

        syncInterval = window.setInterval(() => {
          const s = useSettings.getState().settings;
          if (s.syncUsername && s.syncPassword) {
            void saveBackupToCloud(s.syncUsername, s.syncPassword);
          }
        }, 5 * 60 * 1000);
      }

      if (r.blocked) {
        alert('🚫 تم إيقاف حسابك: ' + r.reason);
        return;
      }

      if (r.maintenance) setMaintenance(true);
      if (r.forceUpdate) setForceUpdate(true);
      if (r.announcement) setAnn(r.announcement);
      if (r.directMessage) setDm(r.directMessage);
    }).catch(error => {
      console.error('Announcement initialization failed:', error);
    });

    return () => {
      cancelled = true;
      if (syncInterval !== undefined) {
        window.clearInterval(syncInterval);
      }
    };
  }, []);`;

if (effectPattern.test(src)) {
  src = src.replace(effectPattern, effectReplacement);
} else {
  stop('لم أتعرف على useEffect المتوقع؛ أوقفت التعديل لحماية الملف');
}

// 5. تحقق من التعديلات
if (!src.includes('const Home = lazy')) stop('فشل تقسيم الصفحات');
if (!src.includes('<Suspense')) stop('Suspense غير موجود');
if (!src.includes('return () => {')) stop('تنظيف المؤقت غير موجود');

if (src === original) {
  console.log('لا توجد تغييرات جديدة.');
  process.exit(0);
}

const backup = `${file}.before-batch-2-${Date.now()}.bak`;
fs.copyFileSync(file, backup);
fs.writeFileSync(file, src);

console.log('✅ تم تقسيم تحميل الصفحات');
console.log(`✅ تم تحويل ${pageImports.length} صفحة إلى lazy loading`);
console.log('✅ تم إصلاح تنظيف مؤقت المزامنة');
console.log('🛡️ النسخة الاحتياطية: ' + backup);
