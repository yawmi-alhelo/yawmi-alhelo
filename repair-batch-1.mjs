import fs from 'node:fs';

const file = 'src/App.tsx';
if (!fs.existsSync(file)) {
  console.error('❌ لم يتم العثور على src/App.tsx');
  process.exit(1);
}

let src = fs.readFileSync(file, 'utf8');
const original = src;
const backup = `${file}.before-repair-${Date.now()}.bak`;

function addImport(name, path) {
  const statement = `import ${name} from '${path}';`;
  if (!src.includes(statement)) {
    src = src.replace(
      /import Placeholder from '\.\/pages\/Placeholder';/,
      `${statement}\nimport Placeholder from './pages/Placeholder';`
    );
  }
}

// إضافة استيراد الصفحات الفعلية
addImport('Favorites', './pages/Favorites');

// ربط المفضلة
if (!src.includes('path="/favorites"')) {
  src = src.replace(
    '<Route path="/shopping" element={<Shopping />} />',
    '<Route path="/shopping" element={<Shopping />} />\n        <Route path="/favorites" element={<Favorites />} />'
  );
}

// لا نستبدل صفحة المواعيد قبل التحقق من وجود مكون صفحة فعلي.
// نضيف الاستيراد فقط إذا كان الملف موجوداً.
const appointmentPage = 'src/pages/Appointments.tsx';
if (fs.existsSync(appointmentPage)) {
  addImport('Appointments', './pages/Appointments');
  src = src.replace(
    '<Route path="/appointments" element={<Placeholder title="المواعيد" />} />',
    '<Route path="/appointments" element={<Appointments />} />'
  );
} else {
  console.log('ℹ️ صفحة Appointments غير موجودة؛ أبقينا المسار كما هو لتجنب كسر التطبيق.');
}

// تنظيف مؤقت المزامنة عند إلغاء تركيب المكون
const oldInterval = `          setInterval(() => {
            const s = useSettings.getState().settings;
            if (s.syncUsername && s.syncPassword) saveBackupToCloud(s.syncUsername, s.syncPassword);
          }, 5 * 60 * 1000);`;

const newInterval = `          const syncInterval = window.setInterval(() => {
            const s = useSettings.getState().settings;
            if (s.syncUsername && s.syncPassword) {
              void saveBackupToCloud(s.syncUsername, s.syncPassword);
            }
          }, 5 * 60 * 1000);
          return () => window.clearInterval(syncInterval);`;

if (src.includes(oldInterval)) {
  src = src.replace(oldInterval, newInterval);
  console.log('⚠️ تم تعديل تنظيف المؤقت، لكن يلزم مراجعة useEffect لأن هناك عمليات غير متزامنة داخله.');
}

if (src === original) {
  console.log('ℹ️ لم يتم إجراء أي تغييرات؛ قد تكون الإصلاحات موجودة مسبقاً.');
  process.exit(0);
}

fs.copyFileSync(file, backup);
fs.writeFileSync(file, src);
console.log('✅ تم حفظ الإصلاحات');
console.log(`🛡️ النسخة الاحتياطية: ${backup}`);
