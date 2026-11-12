import type { PeriodType, Task, PriorityType } from '../types';
import { PERIOD_LABELS, ARABIC_DAYS } from '../types';
import { addDays, todayISO } from './date';

export interface Suggestion {
  title: string;
  period: PeriodType;
  time: string;
  duration: number;
  priority: PriorityType;
  date: string;
  emoji: string;
}

export interface AssistantReply {
  text: string;
  suggestions: Suggestion[];
}

const TASK_RULES: Array<{
  keywords: string[];
  title: string;
  defaultPeriod: PeriodType;
  defaultTime: string;
  defaultDuration: number;
  emoji: string;
}> = [
  { keywords: ['طبخ', 'أطبخ', 'اطبخ', 'أكل', 'اكل', 'غداء', 'عشاء', 'فطور', 'فطوري'], title: 'الطبخ', defaultPeriod: 'beforeNoon', defaultTime: '11:00', defaultDuration: 60, emoji: '🍳' },
  { keywords: ['تنظيف', 'ترتيب', 'رتب', 'نظف', 'غسيل', 'مسح', 'كنس'], title: 'ترتيب البيت', defaultPeriod: 'morning', defaultTime: '08:30', defaultDuration: 45, emoji: '🧹' },
  { keywords: ['تسوق', 'شراء', 'سوق', 'بقالة', 'خضرة', 'خضار'], title: 'التسوق', defaultPeriod: 'afternoon', defaultTime: '16:00', defaultDuration: 60, emoji: '🛒' },
  { keywords: ['دراس', 'دراسة', 'ادرس', 'أدرس', 'مذاكرة', 'مراجعة', 'محاضرة'], title: 'الدراسة', defaultPeriod: 'noon', defaultTime: '13:00', defaultDuration: 120, emoji: '📚' },
  { keywords: ['رياضة', 'مشي', 'جيم', 'تمارين', 'تمرين', 'جري'], title: 'الرياضة', defaultPeriod: 'afternoon', defaultTime: '17:30', defaultDuration: 30, emoji: '🏃‍♀️' },
  { keywords: ['قراءة', 'اقرأ', 'أقرأ', 'كتاب'], title: 'القراءة', defaultPeriod: 'evening', defaultTime: '20:00', defaultDuration: 30, emoji: '📖' },
  { keywords: ['اهتمام', 'عناية', 'سبا', 'مكياج', 'شعر', 'بشرة'], title: 'الاهتمام بالنفس', defaultPeriod: 'evening', defaultTime: '19:00', defaultDuration: 30, emoji: '💅' },
  { keywords: ['أهل', 'اهل', 'زيارة', 'ازور', 'أزور', 'أهلي', 'اهلي'], title: 'زيارة الأهل', defaultPeriod: 'maghrib', defaultTime: '18:30', defaultDuration: 90, emoji: '🏠' },
  { keywords: ['اتصال', 'اكلم', 'أكلم', 'أتصل', 'اتصل', 'مكالمة'], title: 'الاتصال', defaultPeriod: 'maghrib', defaultTime: '19:30', defaultDuration: 15, emoji: '📞' },
  { keywords: ['موعد', 'طبيبة', 'طبيب', 'دكتور', 'مستشفى', 'عيادة'], title: 'متابعة موعد', defaultPeriod: 'noon', defaultTime: '12:00', defaultDuration: 60, emoji: '🏥' },
  { keywords: ['عمل', 'شغل', 'دوام'], title: 'العمل', defaultPeriod: 'morning', defaultTime: '09:00', defaultDuration: 240, emoji: '💼' },
  { keywords: ['شرب', 'ماي', 'ماء', 'مية'], title: 'شرب الماء', defaultPeriod: 'morning', defaultTime: '09:30', defaultDuration: 5, emoji: '💧' },
  { keywords: ['راحة', 'استراحة', 'ارتاح', 'أرتاح'], title: 'الاستراحة', defaultPeriod: 'afternoon', defaultTime: '15:00', defaultDuration: 20, emoji: '☕' },
  { keywords: ['نوم', 'انام', 'أنام', 'ارقد', 'أرقد', 'نعاس'], title: 'النوم', defaultPeriod: 'beforeSleep', defaultTime: '22:30', defaultDuration: 480, emoji: '🌙' },
];

const ARABIC_NUMS: Record<string, number> = {
  'نص': 0.5, 'نصف': 0.5,
  'ربع': 0.25,
  'واحد': 1, 'وحدة': 1, 'واحدة': 1,
  'اثنين': 2, 'اثنتين': 2, 'ثنتين': 2,
  'ثلاث': 3, 'ثلاثة': 3, 'ثلاثه': 3,
  'أربع': 4, 'أربعة': 4, 'اربعه': 4,
  'خمس': 5, 'خمسة': 5, 'خمسه': 5,
  'ست': 6, 'ستة': 6, 'سته': 6,
  'سبع': 7, 'سبعة': 7, 'سبعه': 7,
  'ثمان': 8, 'ثمانية': 8, 'ثمانيه': 8,
  'تسع': 9, 'تسعة': 9, 'تسعه': 9,
  'عشر': 10, 'عشرة': 10, 'عشره': 10,
};

const GREETINGS = ['صباح', 'مساء', 'أهلاً', 'هلا', 'مرحبا', 'هلو'];
const THANKS = ['شكرا', 'شكراً', 'مشكورة', 'عاشت'];
const HELP = ['ساعدني', 'ساعديني', 'رتب', 'خطة', 'جدول', 'شلون'];

function hourToPeriod(h: number): PeriodType {
  if (h >= 5 && h < 9) return 'morning';
  if (h >= 9 && h < 12) return 'beforeNoon';
  if (h >= 12 && h < 15) return 'noon';
  if (h >= 15 && h < 18) return 'afternoon';
  if (h >= 18 && h < 20) return 'maghrib';
  if (h >= 20 && h < 23) return 'evening';
  return 'beforeSleep';
}

function parseNum(token: string): number | null {
  if (/^\d+$/.test(token)) return parseInt(token);
  return ARABIC_NUMS[token] ?? null;
}

function parseDuration(text: string): number | null {
  if (/ساعة\s+ونص|ساعه\s+ونص/.test(text)) return 90;
  if (/ساعتين\s+ونص/.test(text)) return 150;
  if (/ساعتين/.test(text)) return 120;
  if (/(نص|نصف)\s*ساع/.test(text)) return 30;
  if (/ربع\s*ساع/.test(text)) return 15;
  const dm = text.match(/(\d+)\s*دقيق/);
  if (dm) return parseInt(dm[1]);
  const hm = text.match(/([\w\u0600-\u06FF]+)\s*ساع/);
  if (hm) {
    const n = parseNum(hm[1]);
    if (n) return Math.round(n * 60);
  }
  return null;
}

function parseTimeExpr(text: string, now = new Date()): { time: string; period: PeriodType } | null {
  const hhmm = text.match(/الساعة\s+(\d{1,2})(?::(\d{2}))?/);
  if (hhmm) {
    const h = parseInt(hhmm[1]);
    const m = hhmm[2] ? parseInt(hhmm[2]) : 0;
    return { time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, period: hourToPeriod(h) };
  }
  const after = text.match(/بعد\s+(نص|نصف|ربع|ساعة|ساعتين|ساعتين\s+ونص|ساعة\s+ونص|(\d+)\s*دقيق|([\w\u0600-\u06FF]+)\s*ساع)/);
  if (after) {
    let mins = 0;
    const t = after[0];
    if (/ساعة\s+ونص/.test(t)) mins = 90;
    else if (/ساعتين\s+ونص/.test(t)) mins = 150;
    else if (/ساعتين/.test(t)) mins = 120;
    else if (/(نص|نصف)\s*ساع/.test(t)) mins = 30;
    else if (/ربع\s*ساع/.test(t)) mins = 15;
    else if (/(\d+)\s*دقيق/.test(t)) mins = parseInt(t.match(/(\d+)/)![1]);
    else if (/ساعة/.test(t)) mins = 60;
    else {
      const n = parseNum(after[1]);
      if (n) mins = Math.round(n * 60);
    }
    if (mins > 0) {
      const target = new Date(now.getTime() + mins * 60000);
      const h = target.getHours(), m = target.getMinutes();
      return { time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, period: hourToPeriod(h) };
    }
  }
  return null;
}

function parsePriority(text: string): PriorityType | null {
  if (/ضروري|عاجل|أولوية|بسرعة/.test(text)) return 'high';
  if (/مهم(ة|ه)?(\s|$)/.test(text)) return 'medium';
  if (/عادي|بعدين|لاحق/.test(text)) return 'low';
  return null;
}

function parseDate(text: string): string {
  const today = todayISO();
  if (/بعد\s*باجر/.test(text)) return addDays(today, 2);
  if (/باجر|غدا|بكره/.test(text)) return addDays(today, 1);
  if (/اليوم/.test(text)) return today;
  for (let i = 0; i < ARABIC_DAYS.length; i++) {
    if (text.includes(ARABIC_DAYS[i])) {
      const td = new Date(today);
      const diff = (i - td.getDay() + 7) % 7;
      return addDays(today, diff === 0 ? 7 : diff);
    }
  }
  return today;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function detectOverlap(a: Suggestion, existing: Task[]): string | null {
  const aStart = timeToMinutes(a.time);
  const aEnd = aStart + a.duration;
  for (const t of existing) {
    if (t.completed || !t.scheduledTime || t.date !== a.date) continue;
    const tStart = timeToMinutes(t.scheduledTime);
    const tEnd = tStart + (t.durationMinutes || 30);
    if (aStart < tEnd && aEnd > tStart) {
      return `${a.emoji} "${a.title}" يتداخل مع "${t.title}" (${t.scheduledTime})`;
    }
  }
  return null;
}

function pickGreeting(h: number): string {
  if (h >= 5 && h < 12) return 'صباح الورد يا قمرة 🌷';
  if (h >= 12 && h < 17) return 'نهارك سعيد يا حلوة ☀️';
  if (h >= 17 && h < 21) return 'مساء الخير يا وردة 🌸';
  return 'هلا يا حلوة، بعدج سهرانة؟ 🌙';
}

function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'ص' : 'م';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function generateLocalReply(
  userMessage: string,
  existingTasks: Task[] = []
): AssistantReply {
  const msg = userMessage.trim();
  const now = new Date();
  const hour = now.getHours();

  if (!msg) {
    return { text: `${pickGreeting(hour)} شنو خطتج لليوم؟ اكتبيلي شغلاتج وأنا رتبها إلج 🌸`, suggestions: [] };
  }

  const lower = msg.toLowerCase();

  if (GREETINGS.some(g => lower.includes(g)) && msg.length < 30) {
    return { text: `${pickGreeting(hour)} كيف أقدر أساعدج اليوم؟ جربي تكتبين: "بعد ساعة أطبخ ساعتين وأريد أدرس" 🌷`, suggestions: [] };
  }

  if (THANKS.some(t => lower.includes(t))) {
    return { text: 'الله يخليج حبيبتي، هذا شغلي 💗 إذا احتجتي أي شي ثاني، أنا موجودة.', suggestions: [] };
  }

  const explicitDate = parseDate(lower);
  const explicitTime = parseTimeExpr(lower, now);
  const explicitDuration = parseDuration(lower);
  const explicitPriority = parsePriority(lower);

  const found: Suggestion[] = [];
  const seen = new Set<string>();
  for (const rule of TASK_RULES) {
    if (rule.keywords.some(k => lower.includes(k)) && !seen.has(rule.title)) {
      seen.add(rule.title);
      // فقط المهمة الأولى تستفيد من الوقت/المدة الصريحة
      const isFirst = found.length === 0;
      found.push({
        title: rule.title,
        period: isFirst && explicitTime ? explicitTime.period : rule.defaultPeriod,
        time: isFirst && explicitTime ? explicitTime.time : rule.defaultTime,
        duration: isFirst && explicitDuration ? explicitDuration : rule.defaultDuration,
        priority: explicitPriority || 'medium',
        date: explicitDate,
        emoji: rule.emoji,
      });
    }
  }

  if (found.length === 0) {
    if (HELP.some(h => lower.includes(h))) {
      return {
        text: 'تمام يا وردة، قوليلي شغلاتج وأنا أرتبها 🌸\nأمثلة:\n• "طبخ وتنظيف وتسوق"\n• "باجر الصبح أريد أنظف"\n• "بعد ساعة أدرس ساعتين"',
        suggestions: [],
      };
    }
    return {
      text: 'ما فهمت عليج زين 🤔\nجربي:\n• "عندي طبخ وتنظيف وأريد أدرس ساعتين"\n• "بعد نص ساعة أروح للسوق"\n• "باجر الصبح رياضة"',
      suggestions: [],
    };
  }

  // إذا في مهمتين بنفس الوقت، نأخر الثانية ساعة
  const sorted = [...found].sort((a, b) => a.time.localeCompare(b.time));
  const adjusted: Suggestion[] = [];
  for (const s of sorted) {
    const last = adjusted[adjusted.length - 1];
    if (last && timeToMinutes(s.time) < timeToMinutes(last.time) + last.duration) {
      // تداخل → نأخر
      const newStart = timeToMinutes(last.time) + last.duration + 15;
      const h = Math.floor(newStart / 60), m = newStart % 60;
      s.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      s.period = hourToPeriod(h);
    }
    adjusted.push(s);
  }

  const conflicts: string[] = [];
  for (const s of adjusted) {
    const c = detectOverlap(s, existingTasks);
    if (c) conflicts.push(c);
  }

  let text = `${pickGreeting(hour)}\nرتبت لج اليوم بهدوء 🌷\n\n`;
  for (const s of adjusted) {
    const end = (() => {
      const [h, m] = s.time.split(':').map(Number);
      const total = h * 60 + m + s.duration;
      const eh = Math.floor(total / 60) % 24, em = total % 60;
      return fmtTime(`${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`);
    })();
    const dayLabel = s.date !== todayISO() ? ' (باجر)' : '';
    text += `${s.emoji} **${s.title}** — ${PERIOD_LABELS[s.period]}، ${fmtTime(s.time)} → ${end}${dayLabel}\n`;
  }

  const total = adjusted.reduce((sum, s) => sum + s.duration, 0);
  text += `\n⏱️ المجموع: ${Math.round(total / 60 * 10) / 10} ساعة`;

  if (conflicts.length > 0) {
    text += `\n\n⚠️ لاحظت تعارض:\n${conflicts.map(c => '• ' + c).join('\n')}`;
  } else {
    text += '\n\nما بينهم تعارض 👍 اضغطي "طبّقي الجدول" وأنا أضيفهن.';
  }

  if (total > 90) {
    text += '\n\n💡 لا تنسين تاخذين استراحة 15 دقيقة بعد كل ساعتين، تستاهلين 🌸';
  }

  return { text, suggestions: adjusted };
}
