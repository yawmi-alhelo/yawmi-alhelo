package com.yawmialhelo.app;

import android.content.Intent;
import android.provider.Settings;

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
