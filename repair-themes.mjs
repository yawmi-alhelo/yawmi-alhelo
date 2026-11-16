import fs from 'node:fs';

const page = 'src/pages/Settings.tsx';
let s = fs.readFileSync(page, 'utf8');

if (!s.includes('Palette')) {
  if (!/\bUser,\s*Moon,/.test(s)) throw new Error('لم أجد مكان استيراد الأيقونات');
  s = s.replace(/\bUser,\s*Moon,/, 'User, Palette, Moon,');
  console.log('✓ إضافة أيقونة الثيمات');
}

if (!s.includes('اختاري ثيم تطبيقج')) {
  const marker = '      <Section title="المظهر">';
  if (!s.includes(marker)) throw new Error('لم أجد قسم المظهر');

  const themes = `
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={19} className="text-rose-500" />
            <div>
              <p className="font-bold text-sm text-ink-900 dark:text-rose-100">اختاري ثيم تطبيقج</p>
              <p className="text-xs text-ink-500 dark:text-rose-300/80">غيّري ألوان وشكل التطبيق بالكامل 🌸</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'pink-blossom', name: 'Pink Blossom', ar: 'الوردي الزهري', colors: ['#FFF0F5','#FF8FB1','#F06A94'] },
              { id: 'lavender-dream', name: 'Lavender Dream', ar: 'حلم اللافندر', colors: ['#F3EEFF','#B8A4EC','#8065C5'] },
              { id: 'peach-cream', name: 'Peach Cream', ar: 'الخوخي الكريمي', colors: ['#FFF3E9','#FFA878','#E88758'] },
              { id: 'rose-gold', name: 'Rose Gold', ar: 'الوردي الذهبي', colors: ['#FFF0EF','#D98B91','#B77A62'] },
              { id: 'mint-garden', name: 'Mint Garden', ar: 'الحديقة النعناعية', colors: ['#EDFAF3','#7DD3A8','#399B70'] },
              { id: 'pure-white', name: 'Pure White', ar: 'الأبيض الأنيق', colors: ['#FFFFFF','#A7A7B5','#656575'] },
            ].map(theme => {
              const selected = (settings.appTheme || 'pink-blossom') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update({ appTheme: theme.id as import('../types').AppTheme })}
                  className={\`text-right rounded-2xl border-2 p-3 transition-all active:scale-95 \${selected ? 'border-rose-400 shadow-md' : 'border-rose-100 dark:border-[#34343f]'}\`}
                  style={{ background: theme.colors[0] }}
                >
                  <div className="flex gap-1.5 mb-3">
                    {theme.colors.map((color, index) => (
                      <span key={index} className="h-7 flex-1 rounded-lg" style={{ background: color, border: '1px solid rgba(0,0,0,.05)' }} />
                    ))}
                  </div>
                  <p className="font-extrabold text-xs" style={{ color: theme.colors[2] }}>{theme.name}</p>
                  <p className="text-[11px] mt-1" style={{ color: theme.colors[2] }}>{theme.ar}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold" style={{ color: theme.colors[2] }}>
                      {selected ? 'مُطبّق حالياً' : 'اضغطي للتطبيق'}
                    </span>
                    {selected && <CheckCircle2 size={17} style={{ color: theme.colors[2] }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
`;
  s = s.replace(marker, marker + themes);
  console.log('✓ إضافة معرض الثيمات الستة');
} else {
  console.log('✓ معرض الثيمات موجود مسبقاً');
}
fs.writeFileSync(page, s);

const cssFile = 'src/index.css';
let css = fs.readFileSync(cssFile, 'utf8');

if (!css.includes('نظام ثيمات يومي حلو')) {
  css += `

/* ==================== نظام ثيمات يومي حلو ==================== */
html[data-theme] {
  --app-bg: #fff5f8;
  --app-card: #ffffff;
  --app-primary: #ff8fb1;
  --app-primary-dark: #f06a94;
  --app-soft: #ffe4ec;
  --app-text: #2d2d3a;
  --app-muted: #6b6b7b;
  --app-border: #ffe4ec;
}
html[data-theme="pink-blossom"] {
  --app-bg:#fff5f8; --app-card:#fff; --app-primary:#ff8fb1;
  --app-primary-dark:#f06a94; --app-soft:#ffe4ec;
  --app-text:#2d2d3a; --app-muted:#6b6b7b; --app-border:#ffe4ec;
}
html[data-theme="lavender-dream"] {
  --app-bg:#f7f3ff; --app-card:#fff; --app-primary:#a990df;
  --app-primary-dark:#8065c5; --app-soft:#ede6fa;
  --app-text:#302943; --app-muted:#766b89; --app-border:#e3d8f7;
}
html[data-theme="peach-cream"] {
  --app-bg:#fff6ef; --app-card:#fff; --app-primary:#ffa878;
  --app-primary-dark:#e88758; --app-soft:#ffe9d6;
  --app-text:#3b302b; --app-muted:#806d62; --app-border:#ffe2ce;
}
html[data-theme="rose-gold"] {
  --app-bg:#fff4f2; --app-card:#fff; --app-primary:#d98b91;
  --app-primary-dark:#b96c78; --app-soft:#f8e2df;
  --app-text:#3b2c30; --app-muted:#80666a; --app-border:#f0d5d2;
}
html[data-theme="mint-garden"] {
  --app-bg:#f0faf4; --app-card:#fff; --app-primary:#65bd91;
  --app-primary-dark:#399b70; --app-soft:#ddf3e6;
  --app-text:#263a30; --app-muted:#637c6d; --app-border:#d5eddf;
}
html[data-theme="pure-white"] {
  --app-bg:#f7f7fa; --app-card:#fff; --app-primary:#9292a5;
  --app-primary-dark:#656575; --app-soft:#ededf2;
  --app-text:#292936; --app-muted:#737383; --app-border:#e7e7ed;
}
html[data-theme] body {
  background:var(--app-bg) !important;
  color:var(--app-text);
}
html[data-theme] .card-soft {
  background:var(--app-card) !important;
  border-color:var(--app-border);
}
html[data-theme] .bg-rose-50 { background-color:var(--app-bg) !important; }
html[data-theme] .bg-rose-100 { background-color:var(--app-soft) !important; }
html[data-theme] .bg-rose-200 { background-color:var(--app-border) !important; }
html[data-theme] .bg-rose-400 { background-color:var(--app-primary) !important; }
html[data-theme] .bg-rose-500,
html[data-theme] .bg-rose-600 { background-color:var(--app-primary-dark) !important; }
html[data-theme] .text-rose-400,
html[data-theme] .text-rose-500,
html[data-theme] .text-rose-600 { color:var(--app-primary-dark) !important; }
html[data-theme] .border-rose-100,
html[data-theme] .border-rose-200 { border-color:var(--app-border) !important; }
html[data-theme] .btn-primary { background:var(--app-primary) !important; }
html[data-theme] .btn-secondary {
  color:var(--app-primary-dark) !important;
  border-color:var(--app-border) !important;
}
html.dark[data-theme] body {
  background:#1a1a24 !important;
  color:#fce7f3;
}
html.dark[data-theme] .card-soft { background:#252532 !important; }
html.dark[data-theme] .bg-rose-50,
html.dark[data-theme] .bg-rose-100 { background-color:#252532 !important; }
html.dark[data-theme] .bg-rose-400,
html.dark[data-theme] .bg-rose-500,
html.dark[data-theme] .bg-rose-600 {
  background-color:var(--app-primary-dark) !important;
}
html.dark[data-theme] .border-rose-100,
html.dark[data-theme] .border-rose-200 { border-color:#34343f !important; }
`;
  fs.writeFileSync(cssFile, css);
  console.log('✓ إضافة ألوان الثيمات');
} else {
  console.log('✓ ألوان الثيمات موجودة مسبقاً');
}
