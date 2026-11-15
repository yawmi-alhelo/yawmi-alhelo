from pathlib import Path
import re

p = Path("android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherActivity.java")
s = p.read_text()

if "private void renderThemedIcon(" in s:
    print("محرك الأيقونات موجود مسبقاً")
    raise SystemExit(0)

m = re.search(r'(?m)^[ \t]*private\s+void\s+addAppCell\s*\(', s)
if not m:
    raise SystemExit("لم يتم العثور على addAppCell")

helper = r'''
    private void renderThemedIcon(ImageView view, int radius) {
        android.graphics.drawable.Drawable source = view.getDrawable();
        if (source == null) return;

        int size = 192;
        Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        android.graphics.Canvas canvas = new android.graphics.Canvas(bitmap);

        int[][] themes = {
            {0xFFFFD9E8,0xFFF3AFCB,0xFFD875A5},
            {0xFFE4D9FF,0xFFBDA8F0,0xFF8569C7},
            {0xFFFFE2CE,0xFFFFB994,0xFFD98760},
            {0xFFFFE1E5,0xFFE8B6C1,0xFFB8798D},
            {0xFFDDF5E7,0xFFA8DEC0,0xFF579B78},
            {0xFFF0F0F4,0xFFD8D8E2,0xFF85859B}
        };

        int[] colors = themes[Math.max(0,Math.min(selectedTheme,5))];
        String pack = prefs.getString("icon_pack","pastel");

        if ("glass".equals(pack)) colors = new int[]{0xFFEAF5FF,0xFFBEDFF5,0xFF83B9DF};
        if ("midnight".equals(pack)) colors = new int[]{0xFF45415F,0xFF29253E,0xFF171629};
        if ("nature".equals(pack)) colors = new int[]{0xFFE2F1DF,0xFFB9D9B5,0xFF719C70};
        if ("mono".equals(pack)) colors = new int[]{0xFFF1F1F1,0xFFD5D5D5,0xFF999999};
        if ("candy".equals(pack)) colors = new int[]{0xFFFFE2F0,0xFFE8DFFF,0xFFD9A9D5};

        float corner = Math.max(12,Math.min(86,radius))*1.55f;
        android.graphics.RectF bounds = new android.graphics.RectF(3,3,189,189);
        android.graphics.Paint paint = new android.graphics.Paint(3);
        paint.setShader(new android.graphics.LinearGradient(0,0,192,192,colors[0],colors[1],android.graphics.Shader.TileMode.CLAMP));
        canvas.drawRoundRect(bounds,corner,corner,paint);

        canvas.save();
        android.graphics.Path clip = new android.graphics.Path();
        clip.addRoundRect(bounds,corner,corner,android.graphics.Path.Direction.CW);
        canvas.clipPath(clip);
        source.setBounds(31,31,161,161);
        source.draw(canvas);
        canvas.restore();

        paint.setShader(null);
        paint.setStyle(android.graphics.Paint.Style.STROKE);
        paint.setStrokeWidth(4);
        paint.setColor(colors[2]);
        canvas.drawRoundRect(bounds,corner,corner,paint);

        view.setImageBitmap(bitmap);
        view.setBackground(null);
        view.setPadding(0,0,0,0);
        view.setScaleType(ImageView.ScaleType.FIT_XY);
    }

'''
s = s[:m.start()] + helper + s[m.start():]

m = re.search(r'(?m)^[ \t]*private\s+void\s+addAppCell\s*\(', s)
end = s.find("\n    private ",m.end())
if end < 0: end = len(s)
part = s[m.start():end]

anchor = re.search(r'(?m)^([ \t]*)icon\.setClipToOutline\(true\);',part)
if not anchor:
    raise SystemExit("لم يتم العثور على نقطة تركيب الأيقونة")

pos = anchor.end()
part = part[:pos] + "\n" + anchor.group(1) + "renderThemedIcon(icon, individualRadius);" + part[pos:]
s = s[:m.start()] + part + s[end:]

p.write_text(s)
print("SUCCESS: تم تعديل محرك الأيقونات.")
