package com.yawmialhelo.app;

import android.content.Intent;
import android.provider.Settings;
import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "YawmiLauncher")
public class YawmiLauncherPlugin extends Plugin {

    @PluginMethod
    public void openLauncher(PluginCall call) {
        try {
            Intent intent = new Intent(getActivity(), YawmiLauncherActivity.class);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("تعذر فتح اللانشر: " + e.getMessage());
        }
    }


    @PluginMethod
    public void applyTheme(PluginCall call) {
        try {
            String id = call.getString("themeId", "pink-blossom");
            int index = 0;
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
                .apply();

            Intent intent = new Intent(getActivity(), YawmiLauncherActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                            Intent.FLAG_ACTIVITY_CLEAR_TOP);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("تعذر تطبيق الثيم: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setWallpaper(PluginCall call) {
        try {
            String data = call.getString("dataUrl");
            if (data == null || !data.contains(",")) {
                call.reject("صورة الخلفية غير صالحة");
                return;
            }

            byte[] bytes = Base64.decode(
                data.substring(data.indexOf(",") + 1), Base64.DEFAULT
            );
            Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);

            if (bitmap == null) {
                call.reject("تعذر قراءة الصورة");
                return;
            }

            WallpaperManager.getInstance(getContext()).setBitmap(bitmap);
            bitmap.recycle();
            call.resolve();
        } catch (Exception e) {
            call.reject("تعذر تعيين الخلفية: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openHomeSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_HOME_SETTINGS);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("تعذر فتح إعدادات الشاشة الرئيسية: " + e.getMessage());
        }
    }
}
