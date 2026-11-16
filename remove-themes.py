from pathlib import Path
import re, shutil, sys

backup = Path("backup-before-theme-removal")
backup.mkdir(exist_ok=True)

def save(path):
    p = Path(path)
    if p.exists():
        shutil.copy2(p, backup / p.name)

files = [
    "src/App.tsx",
    "src/components/BottomNav.tsx",
    "src/pages/ThemeStudio.tsx",
    "android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherActivity.java",
    "android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherPlugin.java",
]
for f in files:
    save(f)

# إزالة صفحة الثيمات ومسارها
p = Path("src/App.tsx")
s = p.read_text()
s = re.sub(r"^.*ThemeStudio.*\n", "", s, flags=re.M)
s = re.sub(r"^.*path=['\"]\/themes['\"].*\n", "", s, flags=re.M)
p.write_text(s)

# إزالة زر الثيمات وأيقونته من الشريط
p = Path("src/components/BottomNav.tsx")
s = p.read_text()
s = re.sub(r"^.*to:\s*['\"]\/themes['\"].*\n", "", s, flags=re.M)
s = re.sub(r",\s*Palette(?=\s*[,}])", "", s)
s = re.sub(r"\bPalette\s*,\s*", "", s)
s = re.sub(r",\s*Palette\b", "", s)
p.write_text(s)

# حذف صفحة الثيمات
Path("src/pages/ThemeStudio.tsx").unlink(missing_ok=True)

# تنظيف اللانشر مع الإبقاء على تخصيص الأيقونات الفردية
p = Path("android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherActivity.java")
s = p.read_text()

def remove(pattern, label):
    global s
    s2, n = re.subn(pattern, "", s, count=1, flags=re.S)
    if n != 1:
        raise SystemExit("توقف للحماية: لم أجد الجزء المتوقع: " + label)
    s = s2

remove(r"    private final String\[\] themeNames\s*=\s*\{.*?    \};\s*", "themeNames")
remove(r"    private final int\[\] backgrounds\s*=\s*\{.*?    \};\s*", "backgrounds")
remove(r"    private final int\[\] accents\s*=\s*\{.*?    \};\s*", "accents")
s = s.replace("    private int selectedTheme;\n", "")
s = s.replace('        selectedTheme = prefs.getInt("theme", 0);\n', "")

remove(r"    private GradientDrawable iconPackBackground\(.*?\n    private TextView text\(", "iconPackBackground")
remove(r"        selectedTheme = Math\.max\(0, Math\.min\(selectedTheme, backgrounds\.length - 1\)\);\s*.*?View\.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR\s*\);\s*", "theme window setup")
remove(r'        sectionTitle\("ثيمات الشاشة"\);.*?        sectionTitle\("شكل الأيقونات"\);', "theme and icon pack UI")
remove(r"    private void renderThemedIcon\(.*?\nprivate void addAppCell\(", "renderThemedIcon")
remove(r"    private void showIconPackPicker\(.*?\n    private void showIconShapePicker\(", "showIconPackPicker")
remove(r"    private void applyTheme\(.*?\n    @Override\s*\n    protected void onResume\(", "applyTheme")

s = s.replace("root.setBackgroundColor(backgrounds[selectedTheme]);", "root.setBackgroundColor(Color.WHITE);")
s = s.replace("accents[selectedTheme]", "0xFF777777")
s = s.replace("backgrounds[selectedTheme]", "Color.WHITE")
s = s.replace('        icon.setBackground(iconPackBackground(packageName, individualBg, individualRadius));\n', "")
s = s.replace("        renderThemedIcon(icon, individualRadius);\n", "")

for imp in [
    "import android.app.WallpaperManager;\n",
    "import android.graphics.Bitmap;\n",
]:
    s = s.replace(imp, "")

if any(x in s for x in ["selectedTheme", "themeNames", "backgrounds[", "accents[", "renderThemedIcon", "iconPackBackground", "showIconPackPicker", "applyTheme"]):
    raise SystemExit("توقف للحماية: بقيت مراجع للثيمات في اللانشر")

p.write_text(s)

# إزالة وظائف الثيمات والخلفيات من إضافة Android
p = Path("android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherPlugin.java")
s = p.read_text()
s, n1 = re.subn(r"    @PluginMethod\s+public void applyTheme\(.*?\n    @PluginMethod\s+public void setWallpaper\(", "    @PluginMethod\n    public void setWallpaper(", s, count=1, flags=re.S)
if n1 != 1:
    raise SystemExit("توقف للحماية: لم أجد دالة applyTheme")
s, n2 = re.subn(r"    @PluginMethod\s+public void setWallpaper\(.*?\n    @PluginMethod\s+public void openHomeSettings\(", "    @PluginMethod\n    public void openHomeSettings(", s, count=1, flags=re.S)
if n2 != 1:
    raise SystemExit("توقف للحماية: لم أجد دالة setWallpaper")
for imp in [
    "import android.app.WallpaperManager;\n",
    "import android.graphics.Bitmap;\n",
    "import android.graphics.BitmapFactory;\n",
    "import android.util.Base64;\n",
]:
    s = s.replace(imp, "")
p.write_text(s)

print("تم حذف صفحة الثيمات ونظام ثيمات اللانشر.")
print("تم الإبقاء على اللانشر وتخصيص الأيقونات الفردية.")
print("النسخ الاحتياطية محفوظة في:", backup)
