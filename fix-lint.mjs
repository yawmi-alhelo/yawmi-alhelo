import fs from 'fs'; import path from 'path';
const walk = d => fs.readdirSync(d,{withFileTypes:true})
  .flatMap(e => e.isDirectory() ? walk(path.join(d,e.name)) : [path.join(d,e.name)]);
let n = 0;
for (const f of walk('src').filter(f => /\.tsx?$/.test(f))) {
  const s = fs.readFileSync(f,'utf8');
  const o = s.replace(/catch\s*(\([^)]*\))?\s*\{\s*\}/g, 'catch { /* ignore */ }');
  if (o !== s) { fs.writeFileSync(f,o); n++; }
}
console.log('files changed:', n);
