from pathlib import Path
import re

def remove_between(s, start, end, label):
    a = s.find(start)
    if a < 0:
        raise RuntimeError("لم أجد بداية: " + label)
    b = s.find(end, a + len(start))
    if b < 0:
        raise RuntimeError("لم أجد نهاية: " + label)
    return s[:a] + s[b:]

def remove_method(s, signature, next_marker, label):
    return remove_between(s, signature, next_marker, label)

# 1) Launcher Activity
p = Path("android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherActivity.java")
s = p.read_text()

for name in ("themeNames", "backgrounds", "accents"):
    s, n = re.subn(
        r'(?m)^[ \t]*private final (?:String|int)\[\] ' + name +
        r'\s*=\s*\{.*?^[ \t]*\};[ \t]*\n?',
        '', s, count=1, flags=re.S
    )
    if n != 1:
        raise RuntimeError("تعذر حذف تعريف " + name)

s = re.sub(r'(?m)^[ \t]*private int selectedTheme;\s*\n', '', s)
s = re.sub(r'(?m)^[ \t]*selectedTheme = prefs\.getInt\("theme", 0\);\s*\n', '', s)
s = re.sub(r'(?m)^[ \t]*selectedTheme = Math\.max\(.*?;\s*\n', '', s)

s = remove_method(
    s, "    private GradientDrawable iconPackBackground(",
    "    private TextView text(", "iconPackBackground"
)
s = remove_method(
    s, "    private void renderThemedIcon(",
    "    private void addAppCell(", "renderThemedIcon"
)
s = remove_method(
    s, "    private void showIconPackPicker(",
    "    private void showIconShapePicker(", "showIconPackPicker"
)
s = remove_method(
    s, "    private void applyTheme(",
    "    @Override", "applyTheme"
)

s = remove_between(
    s, '        sectionTitle("ثيمات الشاشة");',
    '        sectionTitle("شكل الأيقونات");',
    "واجهة الثيمات وحزم الأيقونات"
)

s = re.sub(r'(?m)^[ \t]*getWindow\(\)\.setStatusBarColor\(.*?\);\s*\n', '', s)
s = re.sub(r'(?m)^[ \t]*getWindow\(\)\.setNavigationBarColor\(.*?\);\s*\n', '', s)

s = s.replace("root.setBackgroundColor(backgrounds[selectedTheme]);",
              "root.setBackgroundColor(0xFFF7F7F7);")
s = s.replace("accents[selectedTheme]", "0xFF777777")
s = s.replace("backgrounds[selectedTheme]", "0xFFF1F1F1")
s = s.replace("int iconBackground = backgrounds[selectedTheme];",
              "int iconBackground = 0xFFF1F1F1;")
s = re.sub(r'(?m)^[ \t]*icon\.setBackground\(iconPackBackground\(.*?\);\s*\n', '', s)
s = re.sub(r'(?m)^[ \t]*renderThemedIcon\(icon, individualRadius\);\s*\n', '', s)
s = s.replace("icon.setScaleType(ImageView.ScaleType.FIT_CENTER);",
              "icon.setBackground(shape(individualBg, individualRadius));\n        icon.setScaleType(ImageView.ScaleType.FIT_CENTER);")

s = s.replace("import android.app.WallpaperManager;\n", "")
s = s.replace("import android.graphics.Bitmap;\n", "")

for term in ("selectedTheme", "themeNames", "backgrounds[", "accents[",
             "iconPackBackground", "renderThemedIcon",
             "showIconPackPicker", "applyTheme"):
    if term in s:
        raise RuntimeError("بقي مرجع للثيمات: " + term)

p.write_text(s)

# 2) Android plugin: remove theme and wallpaper APIs only
p = Path("android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherPlugin.java")
s = p.read_text()

s = remove_between(
    s, "    @PluginMethod\n    public void applyTheme(",
    "    @PluginMethod", "Plugin applyTheme"
)
s = remove_between(
    s, "    @PluginMethod\n    public void setWallpaper(",
    "    @PluginMethod", "Plugin setWallpaper"
)

for imp in (
    "import android.app.WallpaperManager;\n",
    "import android.graphics.Bitmap;\n",
    "import android.graphics.BitmapFactory;\n",
    "import android.util.Base64;\n",
):
    s = s.replace(imp, "")

p.write_text(s)

# 3) Ensure the frontend no longer exposes the themes page
p = Path("src/App.tsx")
s = p.read_text()
s = re.sub(r'(?m)^.*ThemeStudio.*\n', '', s)
s = re.sub(r'(?m)^.*path=["\']/themes["\'].*\n', '', s)
p.write_text(s)

p = Path("src/components/BottomNav.tsx")
s = p.read_text()
s = re.sub(r'(?m)^.*to:\s*["\']/themes["\'].*\n', '', s)
s = re.sub(r'\bPalette\s*,\s*', '', s)
s = re.sub(r',\s*Palette\b', '', s)
p.write_text(s)

Path("src/pages/ThemeStudio.tsx").unlink(missing_ok=True)

print("اكتمل حذف نظام الثيمات وحزم الأيقونات.")
print("تم الحفاظ على اللانشر وتخصيص أيقونات التطبيقات.")
