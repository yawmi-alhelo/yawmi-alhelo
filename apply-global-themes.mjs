import fs from 'node:fs';

const file = 'src/index.css';
const marker = '/* GLOBAL THEME ENGINE V2 */';

let css = fs.readFileSync(file, 'utf8');

if (css.includes(marker)) {
  console.log('نظام الثيمات المركزي مضاف مسبقاً.');
  process.exit(0);
}

const backup = `${file}.before-global-themes-${Date.now()}.bak`;
fs.copyFileSync(file, backup);

css += `

${marker}

/* التطبيق بالكامل */
html[data-theme],
html[data-theme] body,
html[data-theme] #root {
  background-color: var(--app-bg);
  color: var(--app-text);
}

html[data-theme] body {
  background: var(--app-bg) !important;
  color: var(--app-text) !important;
  transition: background-color .25s ease, color .25s ease;
}

/* البطاقات والخلفيات */
html[data-theme] [class~="bg-white"],
html[data-theme] .card-soft {
  background-color: var(--app-card) !important;
}

html[data-theme] [class~="bg-rose-50"] {
  background-color: var(--app-bg) !important;
}
html[data-theme] [class~="bg-rose-100"],
html[data-theme] [class~="bg-lavender-100"],
html[data-theme] [class~="bg-peach-100"],
html[data-theme] [class~="bg-mint-100"] {
  background-color: var(--app-soft) !important;
}
html[data-theme] [class~="bg-rose-200"],
html[data-theme] [class~="bg-lavender-200"],
html[data-theme] [class~="bg-peach-200"],
html[data-theme] [class~="bg-mint-200"] {
  background-color: var(--app-border) !important;
}
html[data-theme] [class~="bg-rose-300"],
html[data-theme] [class~="bg-rose-400"],
html[data-theme] [class~="bg-lavender-300"],
html[data-theme] [class~="bg-peach-300"],
html[data-theme] [class~="bg-mint-300"] {
  background-color: var(--app-primary) !important;
}
html[data-theme] [class~="bg-rose-500"],
html[data-theme] [class~="bg-rose-600"] {
  background-color: var(--app-primary-dark) !important;
}

/* النصوص */
html[data-theme] [class~="text-rose-400"],
html[data-theme] [class~="text-rose-500"],
html[data-theme] [class~="text-rose-600"],
html[data-theme] [class~="text-lavender-300"],
html[data-theme] [class~="text-peach-300"],
html[data-theme] [class~="text-mint-300"] {
  color: var(--app-primary-dark) !important;
}
html[data-theme] [class~="text-ink-900"] {
  color: var(--app-text) !important;
}
html[data-theme] [class~="text-ink-700"],
html[data-theme] [class~="text-ink-500"],
html[data-theme] [class~="text-ink-300"] {
  color: var(--app-muted) !important;
}

/* الحدود */
html[data-theme] [class~="border-rose-100"],
html[data-theme] [class~="border-rose-200"],
html[data-theme] [class~="border-lavender-100"],
html[data-theme] [class~="border-lavender-200"],
html[data-theme] [class~="border-peach-100"],
html[data-theme] [class~="border-mint-100"] {
  border-color: var(--app-border) !important;
}

/* الأزرار والعناصر التفاعلية */
html[data-theme] .btn-primary,
html[data-theme] [class~="bg-rose-400"] {
  background-color: var(--app-primary) !important;
}
html[data-theme] .btn-secondary {
  background-color: var(--app-card) !important;
  color: var(--app-primary-dark) !important;
  border-color: var(--app-border) !important;
}

/* التدرجات اللونية */
html[data-theme] [class*="from-rose-"],
html[data-theme] [class*="from-lavender-"],
html[data-theme] [class*="from-peach-"],
html[data-theme] [class*="from-mint-"] {
  --tw-gradient-from: var(--app-primary) var(--tw-gradient-from-position) !important;
  --tw-gradient-to: var(--app-primary) var(--tw-gradient-to-position) !important;
}
html[data-theme] [class*="via-rose-"],
html[data-theme] [class*="via-lavender-"],
html[data-theme] [class*="via-peach-"],
html[data-theme] [class*="via-mint-"] {
  --tw-gradient-via: var(--app-soft) var(--tw-gradient-via-position) !important;
}
html[data-theme] [class*="to-rose-"],
html[data-theme] [class*="to-lavender-"],
html[data-theme] [class*="to-peach-"],
html[data-theme] [class*="to-mint-"] {
  --tw-gradient-to: var(--app-soft) var(--tw-gradient-to-position) !important;
}

/* الوضع الداكن مستقل عن اختيار الثيم */
html.dark[data-theme],
html.dark[data-theme] body,
html.dark[data-theme] #root {
  background-color: #1a1a24 !important;
  color: #f5f0fa !important;
}
html.dark[data-theme] [class~="bg-white"],
html.dark[data-theme] .card-soft {
  background-color: #252532 !important;
}
html.dark[data-theme] [class~="bg-rose-50"],
html.dark[data-theme] [class~="bg-rose-100"],
html.dark[data-theme] [class~="bg-lavender-100"],
html.dark[data-theme] [class~="bg-peach-100"],
html.dark[data-theme] [class~="bg-mint-100"] {
  background-color: #252532 !important;
}
html.dark[data-theme] [class~="text-ink-900"],
html.dark[data-theme] [class~="text-ink-700"] {
  color: #f5f0fa !important;
}
html.dark[data-theme] [class~="text-ink-500"],
html.dark[data-theme] [class~="text-ink-300"] {
  color: #b9b3c8 !important;
}
html.dark[data-theme] [class~="border-rose-100"],
html.dark[data-theme] [class~="border-rose-200"] {
  border-color: #3a3547 !important;
}
`;

fs.writeFileSync(file, css);
console.log('تمت إضافة نظام الثيمات المركزي.');
console.log('النسخة الاحتياطية:', backup);
