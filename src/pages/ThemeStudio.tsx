import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Heart, ImagePlus, Palette, Smartphone, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';

const themes = [
  {id:'pink-blossom',name:'زهور الربيع',color:'#ff8fb1',bg:'#fff5f8',soft:'#ffe4ec'},
  {id:'lavender-dream',name:'حلم اللافندر',color:'#a990df',bg:'#f7f3ff',soft:'#ede6fa'},
  {id:'peach-cream',name:'كريمة الخوخ',color:'#ffa878',bg:'#fff6ef',soft:'#ffe9d6'},
  {id:'rose-gold',name:'ذهب الورد',color:'#d98b91',bg:'#fff4f2',soft:'#f8e2df'},
  {id:'mint-garden',name:'حديقة النعناع',color:'#65bd91',bg:'#f0faf4',soft:'#ddf3e6'},
  {id:'pure-white',name:'نقاء أبيض',color:'#9292a5',bg:'#f7f7fa',soft:'#ededf2'},
];

const packs = [
  {id:'soft',name:'Soft Pastel',icons:['🌸','🎀','🦋','🌷','💗','🫧']},
  {id:'nature',name:'Nature Mood',icons:['🌿','🍃','🌱','🌼','🪴','🌳']},
  {id:'neon',name:'Neon Night',icons:['🌙','✨','💜','🔮','⭐','🪩']},
  {id:'minimal',name:'Minimal',icons:['◻️','⚪','⬛','◇','○','▫️']},
];

export default function ThemeStudio() {
  const nav = useNavigate();
  const [tab,setTab] = useState('themes');
  const [active,setActive] = useState(localStorage.getItem('yawmi-theme') || 'pink-blossom');
  const [pack,setPack] = useState(localStorage.getItem('yawmi-icon-pack') || 'soft');
  const [favorites,setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('yawmi-theme-favorites') || '[]'));
  const [wallpaper,setWallpaper] = useState(localStorage.getItem('yawmi-wallpaper-preview') || '');

  useEffect(() => {
    document.documentElement.dataset.theme = active;
    localStorage.setItem('yawmi-theme',active);
  },[active]);

  function favorite(id:string) {
    const next = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites,id];
    setFavorites(next);
    localStorage.setItem('yawmi-theme-favorites',JSON.stringify(next));
  }

  function upload(file?:File) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5*1024*1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميغابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      try {
        localStorage.setItem('yawmi-wallpaper-preview',value);
        setWallpaper(value);
      } catch {
        alert('مساحة التخزين غير كافية. اختَر صورة أصغر.');
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <Layout>
      <div dir="rtl" className="space-y-5 pb-5">
        <header className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#29213d] via-[#59416f] to-[#e58eae] p-5 text-white shadow-xl">
          <button onClick={()=>nav(-1)} className="rounded-full bg-white/15 p-2"><ArrowRight size={20}/></button>
          <div className="mt-5 flex items-center gap-2 text-white/80"><Sparkles size={17}/> YAWMI STUDIO</div>
          <h1 className="mt-2 text-3xl font-extrabold">خلّي هاتفك يشبه ذوقك</h1>
          <p className="mt-2 text-sm text-white/80">الثيمات والأيقونات والخلفيات في مكان واحد</p>
        </header>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/5 p-1 dark:bg-white/5">
          {[
            ['themes','الثيمات',Palette],
            ['icons','الأيقونات',Sparkles],
            ['wallpaper','الخلفيات',ImagePlus]
          ].map(([id,label,Icon]:any)=>(
            <button key={id} onClick={()=>setTab(id)}
              className={\`flex items-center justify-center gap-1 rounded-xl py-3 text-xs font-bold \${tab===id?'bg-white text-rose-600 shadow dark:bg-[#343040]':'text-ink-500'}\`}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>

        {tab==='themes' && <>
          <div>
            <h2 className="text-lg font-extrabold text-ink-900 dark:text-rose-100">معرض الثيمات</h2>
            <p className="text-xs text-ink-500">اختَر ثيمك وطبّقه على واجهة يومي الحلو</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {themes.map(t=>(
              <article key={t.id} className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm dark:border-[#393342] dark:bg-[#252532]">
                <div className="relative h-32 p-3" style={{background:t.bg}}>
                  <button onClick={()=>favorite(t.id)} className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-rose-500">
                    <Heart size={16} fill={favorites.includes(t.id)?'currentColor':'none'}/>
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {[t.bg,t.color,t.soft].map((c:string,i)=><span key={i} className="h-8 w-8 rounded-xl shadow-sm" style={{background:c}}/>)}
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-2xl bg-white/70 p-3 text-center shadow">
                    <div className="text-xl">◷</div><div className="text-[9px] font-bold" style={{color:t.color}}>09:41</div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-extrabold text-ink-900 dark:text-rose-100">{t.name}</h3>
                  <button onClick={()=>setActive(t.id)} className={\`mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-xs font-bold \${active===t.id?'bg-emerald-50 text-emerald-700':'bg-rose-500 text-white'}\`}>
                    {active===t.id?<><Check size={14}/> مطبّق</>:'تطبيق الثيم'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>}

        {tab==='icons' && <>
          <h2 className="text-lg font-extrabold text-ink-900 dark:text-rose-100">حزم الأيقونات</h2>
          {packs.map(p=>(
            <article key={p.id} className="rounded-3xl border border-rose-100 bg-white p-4 dark:border-[#393342] dark:bg-[#252532]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-ink-900 dark:text-rose-100">{p.name}</h3>
                <button onClick={()=>{setPack(p.id);localStorage.setItem('yawmi-icon-pack',p.id);}}
                  className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white">
                  {pack===p.id?'محددة':'اختيار'}
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {p.icons.map((x:string,i:number)=><div key={i} className="flex aspect-square items-center justify-center rounded-2xl bg-rose-50 text-2xl dark:bg-[#383044]">{x}</div>)}
              </div>
            </article>
          ))}
          <p className="rounded-2xl bg-amber-50 p-3 text-xs leading-6 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            اختيار الحزمة يُحفظ داخل الاستوديو. ربط الحزمة بأيقونات أندرويد الأصلية هو مرحلة الدمج التالية مع محرك اللانشر.
          </p>
        </>}

        {tab==='wallpaper' && <>
          <h2 className="text-lg font-extrabold text-ink-900 dark:text-rose-100">استوديو الخلفيات</h2>
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-rose-300 bg-white p-8 text-center dark:bg-[#252532]">
            <ImagePlus size={35} className="text-rose-500"/>
            <span className="font-bold">اختيار صورة من المعرض</span>
            <span className="text-xs text-ink-500">JPG أو PNG — حتى 5MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={e=>upload(e.target.files?.[0])}/>
          </label>
          {wallpaper && <div className="overflow-hidden rounded-3xl bg-white p-3 dark:bg-[#252532]">
            <div className="h-72 rounded-2xl bg-cover bg-center" style={{backgroundImage:\`url("\${wallpaper}")\`}}/>
            <button onClick={()=>alert('هذه معاينة محفوظة في استوديو يومي الحلو. ربطها بخلفية نظام أندرويد يأتي مع تكامل اللانشر.')} className="mt-3 w-full rounded-xl bg-rose-500 py-3 text-xs font-bold text-white">معاينة الخلفية</button>
            <button onClick={()=>{localStorage.removeItem('yawmi-wallpaper-preview');setWallpaper('');}} className="mt-2 w-full rounded-xl bg-rose-50 py-2 text-xs text-rose-600">حذف المعاينة</button>
          </div>}
        </>}

        <button onClick={()=>nav('/launcher')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white py-4 font-bold text-rose-600 dark:bg-[#252532] dark:text-rose-200">
          <Smartphone size={18}/> فتح اللانشر الأصلي
        </button>
      </div>
    </Layout>
  );
}
