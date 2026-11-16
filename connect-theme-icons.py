from pathlib import Path
import re

p = Path("android/app/src/main/java/com/yawmialhelo/app/YawmiLauncherPlugin.java")
s = p.read_text()

pattern = r'int index = 0;.*?\.edit\(\)\.putInt\("theme", index\)\.apply\(\);'

replacement = '''int index = 0;
            String iconPack = "candy";

            switch (id) {
                case "lavender-dream":
                    index = 1;
                    iconPack = "glass";
                    break;
                case "peach-cream":
                    index = 2;
                    iconPack = "pastel";
                    break;
                case "rose-gold":
                    index = 3;
                    iconPack = "candy";
                    break;
                case "mint-garden":
                    index = 4;
                    iconPack = "nature";
                    break;
                case "pure-white":
                    index = 5;
                    iconPack = "mono";
                    break;
                default:
                    index = 0;
                    iconPack = "candy";
                    break;
            }

            getActivity().getSharedPreferences("launcher_prefs", 0)
                .edit()
                .putInt("theme", index)
                .putString("icon_pack", iconPack)
                .apply();'''

s2, count = re.subn(pattern, replacement, s, count=1, flags=re.S)

if count != 1:
    raise SystemExit("لم يتم التعديل: لم أجد كتلة applyTheme المتوقعة")

p.write_text(s2)
print("SUCCESS: تم ربط الثيمات بحزم الأيقونات")
