package com.yawmialhelo.app;

import android.app.Activity;
import android.app.WallpaperManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;

public class YawmiLauncherActivity extends Activity {
    private final String[] names = {
        "Pink Blossom", "Lavender Dream", "Peach Cream",
        "Rose Gold", "Mint Garden", "Pure White"
    };
    private final int[] backgrounds = {
        0xFFFFE8F0, 0xFFEDE7FF, 0xFFFFEEE2,
        0xFFF7E8E8, 0xFFE5F5EC, 0xFFF7F7F7
    };
    private final int[] accents = {
        0xFFD85C91, 0xFF8664C7, 0xFFE99569,
        0xFFAD777D, 0xFF579B78, 0xFF777777
    };

    private LinearLayout root;
    private int selected = 0;

    private int dp(float value) {
        return (int)(value * getResources().getDisplayMetrics().density);
    }

    private GradientDrawable shape(int color, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(dp(radius));
        return d;
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(size);
        t.setTextColor(color);
        t.setGravity(Gravity.CENTER);
        if (bold) t.setTypeface(null, Typeface.BOLD);
        return t;
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        selected = getPreferences(0).getInt("theme", 0);
        buildScreen();
    }

    private void buildScreen() {
        selected = Math.max(0, Math.min(selected, names.length - 1));
        getWindow().setStatusBarColor(backgrounds[selected]);
        getWindow().setNavigationBarColor(backgrounds[selected]);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR |
            View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        );

        ScrollView scroll = new ScrollView(this);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(24), dp(18), dp(24));
        root.setBackgroundColor(backgrounds[selected]);
        scroll.setBackgroundColor(backgrounds[selected]);
        scroll.addView(root);

        TextView clock = text(
            android.text.format.DateFormat.format("hh:mm", new Date()).toString(),
            42, accents[selected], true
        );
        root.addView(clock, new LinearLayout.LayoutParams(-1, dp(65)));
        root.addView(text("يومي حلو", 25, Color.DKGRAY, true));
        root.addView(text("شاشة جهازك، بطريقتك", 14, 0xFF777777, false));

        Button openApp = new Button(this);
        openApp.setText("فتح تطبيق يومي حلو");
        openApp.setTextColor(Color.WHITE);
        openApp.setBackground(shape(accents[selected], 24));
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-1, dp(52));
        bp.setMargins(0, dp(18), 0, dp(18));
        root.addView(openApp, bp);
        openApp.setOnClickListener(v -> {
            Intent i = new Intent(this, MainActivity.class);
            startActivity(i);
        });

        root.addView(text("اختار ثيم جهازك", 19, Color.DKGRAY, true));
        LinearLayout themes = new LinearLayout(this);
        themes.setOrientation(LinearLayout.VERTICAL);
        for (int i = 0; i < names.length; i++) {
            final int index = i;
            Button b = new Button(this);
            b.setText((i == selected ? "✓  " : "") + names[i]);
            b.setTextColor(accents[i]);
            b.setBackground(shape(0xFFFFFFFF, 18));
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, dp(48));
            p.setMargins(0, dp(5), 0, dp(5));
            themes.addView(b, p);
            b.setOnClickListener(v -> applyTheme(index));
        }
        root.addView(themes);

        root.addView(text("تطبيقاتك", 20, Color.DKGRAY, true));
        GridLayout grid = new GridLayout(this);
        grid.setColumnCount(4);
        LinearLayout.LayoutParams gp = new LinearLayout.LayoutParams(-1, -2);
        gp.setMargins(0, dp(12), 0, dp(20));
        root.addView(grid, gp);

        Intent query = new Intent(Intent.ACTION_MAIN);
        query.addCategory(Intent.CATEGORY_LAUNCHER);
        ArrayList<ResolveInfo> apps =
            new ArrayList<>(getPackageManager().queryIntentActivities(query, 0));

        Collections.sort(apps, new Comparator<ResolveInfo>() {
            public int compare(ResolveInfo a, ResolveInfo b) {
                return a.loadLabel(getPackageManager()).toString()
                    .compareToIgnoreCase(b.loadLabel(getPackageManager()).toString());
            }
        });

        for (ResolveInfo app : apps) {
            String packageName = app.activityInfo.packageName;
            if (packageName.equals(getPackageName())) continue;

            LinearLayout cell = new LinearLayout(this);
            cell.setOrientation(LinearLayout.VERTICAL);
            cell.setGravity(Gravity.CENTER);
            cell.setPadding(dp(3), dp(8), dp(3), dp(8));

            ImageView icon = new ImageView(this);
            icon.setImageDrawable(app.loadIcon(getPackageManager()));
            cell.addView(icon, new LinearLayout.LayoutParams(dp(48), dp(48)));

            TextView label = text(
                app.loadLabel(getPackageManager()).toString(),
                11, 0xFF333333, false
            );
            label.setMaxLines(2);
            cell.addView(label, new LinearLayout.LayoutParams(-1, dp(38)));

            GridLayout.LayoutParams cp = new GridLayout.LayoutParams();
            cp.width = 0;
            cp.height = -2;
            cp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f);
            grid.addView(cell, cp);

            cell.setOnClickListener(v -> {
                Intent launch = getPackageManager().getLaunchIntentForPackage(packageName);
                if (launch != null) startActivity(launch);
            });
        }

        setContentView(scroll);
    }

    private void applyTheme(int index) {
        selected = index;
        getPreferences(0).edit().putInt("theme", index).apply();

        try {
            Bitmap wallpaper = Bitmap.createBitmap(720, 1600, Bitmap.Config.ARGB_8888);
            wallpaper.eraseColor(backgrounds[index]);
            WallpaperManager.getInstance(this).setBitmap(wallpaper);
            wallpaper.recycle();
        } catch (Exception e) {
            android.widget.Toast.makeText(
                this, "تم حفظ الثيم، تعذر تغيير الخلفية: " + e.getMessage(),
                android.widget.Toast.LENGTH_LONG
            ).show();
        }

        buildScreen();
        android.widget.Toast.makeText(
            this, "تم تطبيق " + names[index],
            android.widget.Toast.LENGTH_SHORT
        ).show();
    }
}
