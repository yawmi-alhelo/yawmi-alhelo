package com.yawmialhelo.app;

import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.widget.ImageView;

public final class LauncherIconStyle {
    private LauncherIconStyle() {}

    public static void apply(
        ImageView icon,
        String packageName,
        android.content.SharedPreferences prefs
    ) {
        if (icon == null || packageName == null || prefs == null) return;

        String color = prefs.getString("icon_bg_" + packageName, "");
        float size = prefs.getFloat("icon_size_" + packageName, 1.0f);

        if (color != null && !color.isEmpty()) {
            try {
                GradientDrawable bg = new GradientDrawable();
                bg.setColor(Color.parseColor(color));
                bg.setCornerRadius(22f);
                icon.setBackground(bg);
                icon.setPadding(5, 5, 5, 5);
            } catch (IllegalArgumentException ignored) {}
        }

        float scale = Math.max(0.65f, Math.min(1.35f, size));
        icon.setScaleX(scale);
        icon.setScaleY(scale);
        icon.setAdjustViewBounds(true);
    }
}
