import fs from 'node:fs';

const file = 'src/index.css';
const css = fs.readFileSync(file, 'utf8');
const marker = '/* YAWMI GLOBAL THEME V3 */';

if (css.includes(marker)) {
  console.log('نظام V3 موجود مسبقاً؛ لا يوجد تكرار.');
  process.exit(0);
}

const backup = `${file}.before-v3-${Date.now()}.bak`;
fs.copyFileSync(file, backup);

const addition = `

${marker}

/* توحيد أسطح التطبيق */
html[data-theme] {
  color-scheme: light;
  background: var(--app-bg);
}

html[data-theme] body,
html[data-theme] #root,
html[data-theme] main {
  background-color: var(--app-bg);
  color: var(--app-text);
}

/* البطاقات والحاويات */
html[data-theme] .card,
html[data-theme] .card-soft,
html[data-theme] [class~="bg-white"],
html[data-theme] [class~="bg-gray-50"],
html[data-theme] [class~="bg-slate-50"] {
  background-color: var(--app-card) !important;
  border-color: var(--app-border);
}

/* الحقول */
html[data-theme] input:not([type="checkbox"]):not([type="radio"]),
html[data-theme] textarea,
html[data-theme] select {
  background-color: var(--app-card);
  color: var(--app-text);
  border-color: var(--app-border);
}

html[data-theme] input::placeholder,
html[data-theme] textarea::placeholder {
  color: var(--app-muted);
}

/* القوائم والنوافذ */
html[data-theme] [role="dialog"],
html[data-theme] [role="menu"],
html[data-theme] [role="listbox"],
html[data-theme] .dropdown-menu,
html[data-theme] .modal-content {
  background-color: var(--app-card);
  color: var(--app-text);
  border-color: var(--app-border);
}

/* التحديد والتركيز */
html[data-theme] button:focus-visible,
html[data-theme] input:focus-visible,
html[data-theme] textarea:focus-visible,
html[data-theme] select:focus-visible {
  outline-color: var(--app-primary);
}

/* الظلال */
html[data-theme] .shadow,
html[data-theme] .shadow-sm,
html[data-theme] .shadow-md,
html[data-theme] .shadow-lg {
  --tw-shadow-color: var(--app-border);
}

/* الوضع الداكن */
html.dark[data-theme] {
  color-scheme: dark;
}

html.dark[data-theme] input,
html.dark[data-theme] textarea,
html.dark[data-theme] select {
  background-color: #252532;
  color: #f5f0fa;
  border-color: #3a3547;
}

html.dark[data-theme] [role="dialog"],
html.dark[data-theme] [role="menu"],
html.dark[data-theme] [role="listbox"],
html.dark[data-theme] .dropdown-menu,
html.dark[data-theme] .modal-content {
  background-color: #252532;
  color: #f5f0fa;
  border-color: #3a3547;
}
`;

fs.writeFileSync(file, css + addition);
console.log('تم تطبيق توحيد الثيمات V3.');
console.log('النسخة الاحتياطية:', backup);
