import { registerPlugin } from '@capacitor/core';
import React, { useState } from 'react';
import Layout from '../components/Layout';

const themes = [
  {id:'blossom',name:'Pink Blossom',type:'Aesthetic',image:'photo-1490750967868-88aa4486c946',color:'#ed9cbd'},
  {id:'ocean',name:'Ocean Dreams',type:'Nature',image:'photo-1518837695005-2083093ee35b',color:'#4d9bc4'},
  {id:'sunset',name:'Golden Sunset',type:'Nature',image:'photo-1470252649378-9c29740c9fa8',color:'#d99863'},
  {id:'mountain',name:'Mountain Mood',type:'Nature',image:'photo-1519681393784-d120267933ba',color:'#777cae'},
  {id:'minimal',name:'Minimal Beige',type:'Minimal',image:'photo-1500534623283-312aade485b7',color:'#c6ae91'},
  {id:'forest',name:'Forest Green',type:'Nature',image:'photo-1448375240586-882707db888b',color:'#5e8664'},
  {id:'dream',name:'Dreamy Flowers',type:'Cute',image:'photo-1497250681960-ef046c08a56e',color:'#a5b98b'},
  {id:'night',name:'Midnight',type:'Dark',image:'photo-1519608487953-e999c86e7455',color:'#333b65'},
  {id:'pinksky',name:'Pink Sky',type:'Aesthetic',image:'photo-1534447677768-be436bb09401',color:'#bd91bb'},
  {id:'coast',name:'Blue Coast',type:'Minimal',image:'photo-1507525428034-b723cf961d3e',color:'#5c9eb7'},
  {id:'flowers',name:'Soft Garden',type:'Cute',image:'photo-1462275646964-a0e3386b89fa',color:'#b78caa'},
  {id:'abstract',name:'Abstract Art',type:'Aesthetic',image:'photo-1541701494587-cb58502866ab',color:'#a276bb'},
];

const packs = [
  {id:'pastel',name:'Pastel Collection',colors:['#f3b5cf','#c5b1ec','#f4d99a','#a8d6c1']},
  {id:'glass',name:'Glass Icons',colors:['#a7d7ed','#c9b9ed','#a8e2cf','#f1c7dc']},
  {id:'dark',name:'Dark Minimal',colors:['#252b38','#424b60','#68748a','#a0aabd']},
  {id:'nature',name:'Nature Icons',colors:['#719c70','#b6c98b','#d5b67d','#82b9a9']},
  {id:'neon',name:'Neon Collection',colors:['#00d9ff','#b54dff','#ff4c9a','#a8ff42']},
  {id:'cream',name:'Cream Aesthetic',colors:['#d9c4a4','#bca58a','#eee0c9','#a88e75']},
];

const categories = ['All','Aesthetic','Nature','Minimal','Cute','Dark'];


const YawmiLauncher = registerPlugin<{
  setWallpaper(options: { dataUrl: string }): Promise<void>;
  applyTheme(options: { themeId: string }): Promise<void>;
}>('YawmiLauncher');

async function applyPhoneWallpaper(source: string) {
  try {
    let dataUrl = source;

    if (!source.startsWith('data:')) {
      const response = await fetch(source);
      if (!response.ok) throw new Error('تعذر تحميل الصورة');
      const blob = await response.blob();

      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('تعذرت قراءة الصورة'));
        reader.readAsDataURL(blob);
      });
    }

    await YawmiLauncher.setWallpaper({ dataUrl });
    alert('تم تعيين خلفية الهاتف بنجاح');
  } catch (error) {
    console.error(error);
    alert('تعذر تعيين الخلفية. جرّب صورة محفوظة من جهازك.');
  }
}

const imageUrl = (id:string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85`;

export default function ThemeStudio() {
  const [tab,setTab] = useState('themes');
  const [category,setCategory] = useState('All');
  const [selected,setSelected] = useState<string|null>(null);
  const [favorites,setFavorites] = useState<string[]>([]);
  const [selectedPack,setSelectedPack] = useState('pastel');
  const [wallpaper,setWallpaper] = useState('');

  const activeTheme = themes.find(t=>t.id===selected);
  const visible = themes.filter(t=>category==='All'||t.type===category);

  const apply = async (theme:typeof themes[number]) => {
    localStorage.setItem('yawmi-color-theme',theme.id);
    localStorage.setItem('yawmi-theme-image',imageUrl(theme.image));
    localStorage.setItem('yawmi-theme-color',theme.color);
    document.documentElement.style.setProperty('--theme-accent',theme.color);
    setSelected(theme.id);

    const nativeThemes: Record<string,string> = {
      blossom: 'pink-blossom',
      ocean: 'mint-garden',
      sunset: 'peach-cream',
      mountain: 'lavender-dream',
      minimal: 'pure-white',
      forest: 'mint-garden',
      dream: 'lavender-dream',
      night: 'pure-white',
      pinksky: 'rose-gold',
      coast: 'mint-garden',
      flowers: 'rose-gold',
      abstract: 'lavender-dream'
    };

    try {
      await YawmiLauncher.applyTheme({
        themeId: nativeThemes[theme.id] || 'pink-blossom'
      });
      alert('تم تطبيق الثيم على اللانشر');
    } catch (error) {
      console.error('Native theme error:', error);
      alert('تم حفظ الثيم، لكن تعذر تطبيقه على اللانشر');
    }
  };

  const favorite = (id:string) => {
    const next = favorites.includes(id)
      ? favorites.filter(x=>x!==id)
      : [...favorites,id];
    setFavorites(next);
    localStorage.setItem('yawmi-theme-favorites',JSON.stringify(next));
  };

  const upload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0];
    if(!file)return;
    if(!file.type.startsWith('image/')||file.size>5*1024*1024){
      alert('اختر صورة صالحة بحجم أقل من 5MB');
      return;
    }
    const reader=new FileReader();
    reader.onload=()=>{
      const result=String(reader.result);
      setWallpaper(result);
      try{localStorage.setItem('yawmi-wallpaper-preview',result);}
      catch{alert('الصورة أكبر من مساحة التخزين المتاحة');}
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <main dir="rtl" style={{minHeight:'100vh',padding:'18px 14px 90px',background:'var(--background,#f7f7fa)'}}>
        <style>{`
          .ts-tabs{display:flex;gap:9px;overflow:auto;padding:5px 0 14px}
          .ts-tab{border:1px solid var(--border,#ddd);background:var(--card,#fff);border-radius:30px;padding:10px 17px;white-space:nowrap;font-weight:700;color:var(--foreground,inherit)}
          .ts-tab.on{background:#242536;color:#fff;border-color:#242536}
          .ts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
          .ts-card{background:var(--card,#fff);border:1px solid var(--border,#eee);border-radius:18px;overflow:hidden;min-width:0}
          .ts-photo{width:100%;height:190px;object-fit:cover;display:block}
          .ts-btn{border:0;border-radius:12px;padding:10px 13px;background:#252536;color:white;font-weight:800;width:100%}
          .ts-muted{color:var(--muted-foreground,#888);font-size:12px}
          .ts-pack{padding:15px;border:1px solid var(--border,#eee);border-radius:17px;background:var(--card,#fff);text-align:center}
          .ts-swatch{height:34px;width:34px;border-radius:11px;border:2px solid white;box-shadow:0 2px 8px #0002}
        `}</style>

        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:19}}>
          <div>
            <div className="ts-muted" style={{letterSpacing:2}}>YAWMI ALHELO STUDIO</div>
            <h1 style={{fontSize:27,fontWeight:900,margin:'5px 0'}}>اكتشف ستايلك</h1>
            <div className="ts-muted">ثيمات وخلفيات وأيقونات بتصاميم مميزة</div>
          </div>
          <div style={{width:48,height:48,borderRadius:15,background:'linear-gradient(135deg,#f3a9c5,#bca8ef,#83c9a5)',boxShadow:'0 5px 18px #0002'}}/>
        </header>

        {activeTheme && (
          <section className="ts-card" style={{marginBottom:19,position:'relative'}}>
            <img src={imageUrl(activeTheme.image)} className="ts-photo" alt={activeTheme.name} style={{height:175}}/>
            <div style={{padding:13,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><strong>{activeTheme.name}</strong><div className="ts-muted">الثيم المختار</div></div>
              <span style={{background:activeTheme.color,width:30,height:30,borderRadius:50}}/>
            </div>
          </section>
        )}

        <nav className="ts-tabs">
          {[['themes','الثيمات'],['icons','الأيقونات'],['wallpaper','الخلفيات'],['diy','DIY']].map(([id,label])=>(
            <button key={id} className={`ts-tab ${tab===id?'on':''}`} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </nav>

        {tab==='themes' && <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'8px 0 12px'}}>
            <h2 style={{fontSize:20,fontWeight:900}}>ثيمات مميزة</h2>
            <span className="ts-muted">{visible.length} تصميم</span>
          </div>
          <div className="ts-tabs">
            {categories.map(c=><button key={c} className={`ts-tab ${category===c?'on':''}`} onClick={()=>setCategory(c)}>{c}</button>)}
          </div>
          <div className="ts-grid">
            {visible.map(theme=>(
              <article className="ts-card" key={theme.id}>
                <div style={{position:'relative'}}>
                  <img className="ts-photo" src={imageUrl(theme.image)} alt={theme.name} loading="lazy"/>
                  <button onClick={()=>favorite(theme.id)} aria-label="Favorite" style={{position:'absolute',top:10,left:10,width:36,height:36,border:0,borderRadius:50,background:'#ffffffed',fontSize:19,color:favorites.includes(theme.id)?'#e64b79':'#555'}}>
                    {favorites.includes(theme.id)?'♥':'♡'}
                  </button>
                </div>
                <div style={{padding:11}}>
                  <strong style={{display:'block',fontSize:14}}>{theme.name}</strong>
                  <span className="ts-muted">{theme.type}</span>
                  <button className="ts-btn" style={{marginTop:10}} onClick={()=>apply(theme)}>
                    {selected===theme.id?'تم الاختيار ✓':'معاينة وتطبيق'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>}

        {tab==='icons' && <>
          <h2 style={{fontSize:20,fontWeight:900,margin:'8px 0'}}>Icon Packs</h2>
          <p className="ts-muted">حزم أيقونات بتناسق لوني وتصميم موحد</p>
          <div className="ts-grid">
            {packs.map(pack=>(
              <button key={pack.id} className="ts-pack" onClick={()=>{setSelectedPack(pack.id);localStorage.setItem('yawmi-icon-pack',pack.id);}}>
                <div style={{display:'flex',justifyContent:'center',gap:5,marginBottom:13}}>
                  {pack.colors.map((color,i)=><div key={color} className="ts-swatch" style={{background:color,borderRadius:i%2?'50%':11}}/>)}
                </div>
                <strong style={{fontSize:14}}>{pack.name}</strong>
                <div className="ts-muted" style={{marginTop:7}}>{selectedPack===pack.id?'محدد ✓':'اختيار الحزمة'}</div>
              </button>
            ))}
          </div>
          <p className="ts-muted" style={{marginTop:15}}>اختيار الحزمة يحفظ تفضيلك. تطبيق صور الأيقونات على التطبيقات يتطلب ربط ملفات الحزمة بمحرك Android Launcher.</p>
        </>}

        {tab==='wallpaper' && <>
          <h2 style={{fontSize:20,fontWeight:900,margin:'8px 0 14px'}}>Wallpaper Gallery</h2>
          <div className="ts-grid">
            {themes.map(theme=>(
              <button key={theme.id} className="ts-card" style={{padding:0,textAlign:'right'}} onClick={()=>{setWallpaper(imageUrl(theme.image));localStorage.setItem('yawmi-wallpaper-image',imageUrl(theme.image));}}>
                <img src={imageUrl(theme.image)} alt={theme.name} className="ts-photo"/>
                <div style={{padding:10,fontWeight:700,fontSize:13}}>{theme.name}</div>
              </button>
            ))}
          </div>
          {wallpaper && <div className="ts-card" style={{marginTop:15,padding:12}}>
            <img src={wallpaper} alt="Wallpaper preview" style={{width:'100%',height:260,objectFit:'cover',borderRadius:13}}/>
            <p className="ts-muted">تم حفظ اختيار الخلفية للمعاينة.</p>
            <button className="ts-btn" style={{marginTop:10}}
              onClick={() => applyPhoneWallpaper(wallpaper)}>
              تعيين كخلفية الهاتف
            </button>
          </div>}
        </>}

        {tab==='diy' && <>
          <h2 style={{fontSize:20,fontWeight:900,margin:'8px 0'}}>DIY Wallpaper Studio</h2>
          <p className="ts-muted">أنشئ خلفيتك من صورك الخاصة</p>
          <label className="ts-card" style={{display:'block',padding:25,textAlign:'center',cursor:'pointer'}}>
            <div style={{fontSize:15,fontWeight:900}}>استيراد صورة من المعرض</div>
            <div className="ts-muted" style={{marginTop:8}}>JPG / PNG · حتى 5MB</div>
            <input type="file" accept="image/*" onChange={upload} style={{display:'none'}}/>
          </label>
          {wallpaper && <div className="ts-card" style={{marginTop:15,padding:12}}>
            <img src={wallpaper} alt="DIY preview" style={{width:'100%',height:300,objectFit:'cover',borderRadius:13}}/>
            <button className="ts-btn" style={{marginTop:10}}
              onClick={() => applyPhoneWallpaper(wallpaper)}>
              تطبيق الخلفية على الهاتف
            </button>
          </div>}
        </>}
      </main>
    </Layout>
  );
}
