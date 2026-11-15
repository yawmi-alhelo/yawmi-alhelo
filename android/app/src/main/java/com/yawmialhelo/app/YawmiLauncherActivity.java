package com.yawmialhelo.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.WallpaperManager;
import android.content.Intent;
import android.net.Uri;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

public class YawmiLauncherActivity extends Activity {

    private final String[] themeNames = {
        "وردي", "لافندر", "خوخي", "روز", "نعناعي", "أبيض"
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
    private GridLayout grid;
    private EditText search;
    private TextView clockView;
    private TextView filterLabel;
    private int selectedTheme;
    private int iconStyle;
    private int iconSize;
    private boolean favoritesOnly = false;

    private final ArrayList<ResolveInfo> allApps = new ArrayList<>();
    private final Set<String> favorites = new HashSet<>();

    private final Handler handler = new Handler();
    private final Runnable clockTick = new Runnable() {
        @Override
        public void run() {
            if (clockView != null) {
                clockView.setText(android.text.format.DateFormat.format("hh:mm", new Date()));
                handler.postDelayed(this, 1000);
            }
        }
    };

    private SharedPreferences prefs;
    private String pendingIconPackage;
    private static final int PICK_ICON_REQUEST = 7412;

    private int dp(float value) {
        return (int) (value * getResources().getDisplayMetrics().density);
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
        prefs = getPreferences(0);
        selectedTheme = prefs.getInt("theme", 0);
        iconStyle = prefs.getInt("icon_style", 0);
        iconSize = prefs.getInt("icon_size", 48);
        favorites.addAll(prefs.getStringSet("favorites", new HashSet<>()));
        loadApps();
        buildScreen();
    }

    private void loadApps() {
        allApps.clear();
        Intent query = new Intent(Intent.ACTION_MAIN);
        query.addCategory(Intent.CATEGORY_LAUNCHER);

        allApps.addAll(getPackageManager().queryIntentActivities(query, 0));

        Collections.sort(allApps, new Comparator<ResolveInfo>() {
            @Override
            public int compare(ResolveInfo a, ResolveInfo b) {
                return a.loadLabel(getPackageManager()).toString()
                    .compareToIgnoreCase(
                        b.loadLabel(getPackageManager()).toString()
                    );
            }
        });
    }

    private void buildScreen() {
        handler.removeCallbacks(clockTick);

        selectedTheme = Math.max(0, Math.min(selectedTheme, backgrounds.length - 1));

        getWindow().setStatusBarColor(backgrounds[selectedTheme]);
        getWindow().setNavigationBarColor(backgrounds[selectedTheme]);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR |
            View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        );

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(22), dp(18), dp(28));
        root.setBackgroundColor(backgrounds[selectedTheme]);
        scroll.addView(root);

        clockView = text("", 48, accents[selectedTheme], true);
        root.addView(clockView, new LinearLayout.LayoutParams(-1, dp(72)));
        clockTick.run();

        root.addView(text("يومي حلو", 27, 0xFF33313A, true));
        root.addView(text("مساحتك الخاصة، على ذوقك", 13, 0xFF77717B, false));

        Button openApp = button("فتح تطبيق يومي حلو", accents[selectedTheme]);
        LinearLayout.LayoutParams openParams = new LinearLayout.LayoutParams(-1, dp(50));
        openParams.setMargins(0, dp(16), 0, dp(18));
        root.addView(openApp, openParams);
        openApp.setOnClickListener(v -> {
            Intent i = new Intent(this, MainActivity.class);
            startActivity(i);
        });

        sectionTitle("ثيمات الشاشة");
        HorizontalScrollView themeScroll = new HorizontalScrollView(this);
        themeScroll.setHorizontalScrollBarEnabled(false);
        LinearLayout themeRow = new LinearLayout(this);
        themeRow.setOrientation(LinearLayout.HORIZONTAL);

        for (int i = 0; i < themeNames.length; i++) {
            final int index = i;
            Button b = button(
                (selectedTheme == i ? "✓ " : "") + themeNames[i],
                accents[i]
            );
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(dp(100), dp(44));
            p.setMargins(dp(3), dp(5), dp(7), dp(9));
            themeRow.addView(b, p);
            b.setOnClickListener(v -> applyTheme(index));
        }

        themeScroll.addView(themeRow);
        root.addView(themeScroll);

        sectionTitle("شكل الأيقونات");

        LinearLayout styleRow = new LinearLayout(this);
        styleRow.setOrientation(LinearLayout.HORIZONTAL);
        String[] styles = {"دائري", "مستدير", "مربع"};

        for (int i = 0; i < styles.length; i++) {
            final int index = i;
            Button b = button(
                (iconStyle == i ? "✓ " : "") + styles[i],
                accents[selectedTheme]
            );
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(44), 1);
            p.setMargins(dp(3), dp(4), dp(3), dp(4));
            styleRow.addView(b, p);
            b.setOnClickListener(v -> {
                iconStyle = index;
                prefs.edit().putInt("icon_style", iconStyle).apply();
                buildScreen();
            });
        }
        root.addView(styleRow);

        LinearLayout sizeRow = new LinearLayout(this);
        sizeRow.setOrientation(LinearLayout.HORIZONTAL);
        String[] sizes = {"صغير", "متوسط", "كبير"};
        int[] values = {40, 48, 56};

        for (int i = 0; i < sizes.length; i++) {
            final int value = values[i];
            Button b = button(
                (iconSize == value ? "✓ " : "") + sizes[i],
                accents[selectedTheme]
            );
            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(42), 1);
            p.setMargins(dp(3), dp(4), dp(3), dp(12));
            sizeRow.addView(b, p);
            b.setOnClickListener(v -> {
                iconSize = value;
                prefs.edit().putInt("icon_size", iconSize).apply();
                buildScreen();
            });
        }
        root.addView(sizeRow);

        sectionTitle("تطبيقاتك");

        search = new EditText(this);
        search.setSingleLine(true);
        search.setTextSize(14);
        search.setHint("ابحث عن تطبيق...");
        search.setPadding(dp(16), dp(5), dp(16), dp(5));
        search.setTextColor(0xFF33313A);
        search.setHintTextColor(0xFF99919A);
        search.setBackground(shape(Color.WHITE, 18));
        LinearLayout.LayoutParams searchParams = new LinearLayout.LayoutParams(-1, dp(48));
        searchParams.setMargins(0, dp(5), 0, dp(10));
        root.addView(search, searchParams);

        Button filter = button(
            favoritesOnly ? "★ عرض كل التطبيقات" : "☆ عرض المفضلة فقط",
            accents[selectedTheme]
        );
        root.addView(filter, new LinearLayout.LayoutParams(-1, dp(43)));
        filter.setOnClickListener(v -> {
            favoritesOnly = !favoritesOnly;
            filter.setText(favoritesOnly ? "★ عرض كل التطبيقات" : "☆ عرض المفضلة فقط");
            updateGrid();
        });

        grid = new GridLayout(this);
        grid.setColumnCount(4);
        LinearLayout.LayoutParams gp = new LinearLayout.LayoutParams(-1, -2);
        gp.setMargins(0, dp(12), 0, dp(20));
        root.addView(grid, gp);

        search.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int st, int c, int a) {}
            @Override public void onTextChanged(CharSequence s, int st, int before, int count) {
                updateGrid();
            }
            @Override public void afterTextChanged(Editable e) {}
        });

        updateGrid();
        setContentView(scroll);
    }

    private Button button(String label, int color) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(12);
        b.setAllCaps(false);
        b.setTextColor(Color.WHITE);
        b.setBackground(shape(color, 18));
        return b;
    }

    private void sectionTitle(String title) {
        TextView t = text(title, 18, 0xFF37313B, true);
        t.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, dp(42));
        p.setMargins(0, dp(9), 0, dp(3));
        root.addView(t, p);
    }

    private void updateGrid() {
        if (grid == null) return;
        grid.removeAllViews();

        String term = search == null ? "" : search.getText().toString().trim().toLowerCase();

        int count = 0;
        for (ResolveInfo app : allApps) {
            String packageName = app.activityInfo.packageName;
            if (packageName.equals(getPackageName())) continue;

            String label = app.loadLabel(getPackageManager()).toString();

            if (!label.toLowerCase().contains(term)) continue;
            if (favoritesOnly && !favorites.contains(packageName)) continue;

            addAppCell(app, label, packageName);
            count++;
        }

        if (count == 0) {
            TextView empty = text("ماكو تطبيقات مطابقة", 14, 0xFF77717B, false);
            GridLayout.LayoutParams p = new GridLayout.LayoutParams();
            p.width = -1;
            p.height = dp(90);
            grid.addView(empty, p);
        }
    }

    
    private void applySavedIconShape(ImageView icon, String packageName) {
        android.content.SharedPreferences prefs =
            getSharedPreferences("launcher_prefs", MODE_PRIVATE);
        String shape = prefs.getString("icon_shape_" + packageName, "rounded");
        float radius = prefs.getFloat("icon_radius_" + packageName, 22f);
        LauncherIconShape.apply(icon, shape, radius);
    }

private void addAppCell(ResolveInfo app, String label, String packageName) {
        LinearLayout cell = new LinearLayout(this);
        cell.setOrientation(LinearLayout.VERTICAL);
        cell.setGravity(Gravity.CENTER);
        cell.setPadding(dp(3), dp(9), dp(3), dp(8));

        int iconBackground = backgrounds[selectedTheme];
        int radius = iconStyle == 0 ? 100 : (iconStyle == 1 ? 20 : 7);

        ImageView icon = new ImageView(this);
        String savedUri = prefs.getString("icon_uri_" + packageName, null);
        int individualBg = prefs.getInt("icon_bg_" + packageName, iconBackground);
        int individualRadius = prefs.getInt("icon_radius_" + packageName, radius);
        int individualSize = prefs.getInt("icon_size_" + packageName, iconSize);

        if (savedUri != null) {
            try {
                icon.setImageURI(Uri.parse(savedUri));
        applySavedIconShape(icon, packageName);
            } catch (Exception ignored) {
                icon.setImageDrawable(app.loadIcon(getPackageManager()));
            }
        } else {
            icon.setImageDrawable(app.loadIcon(getPackageManager()));
        }

        icon.setScaleType(ImageView.ScaleType.FIT_CENTER);
        icon.setPadding(dp(5), dp(5), dp(5), dp(5));
        icon.setBackground(shape(individualBg, individualRadius));
        icon.setClipToOutline(true);

        cell.addView(icon, new LinearLayout.LayoutParams(dp(individualSize), dp(individualSize)));

        TextView name = text(label, 11, 0xFF38323B, true);
        name.setMaxLines(2);
        name.setEllipsize(android.text.TextUtils.TruncateAt.END);
        cell.addView(name, new LinearLayout.LayoutParams(-1, dp(36)));

        if (favorites.contains(packageName)) {
            TextView star = text("★", 12, accents[selectedTheme], true);
            cell.addView(star, new LinearLayout.LayoutParams(-1, dp(17)));
        }

        GridLayout.LayoutParams cp = new GridLayout.LayoutParams();
        cp.width = 0;
        cp.height = -2;
        cp.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f);
        grid.addView(cell, cp);

        cell.setOnClickListener(v -> {
            Intent launch = getPackageManager().getLaunchIntentForPackage(packageName);
            if (launch != null) {
                try {
                    startActivity(launch);
                } catch (Exception e) {
                    Toast.makeText(this, "تعذر فتح التطبيق", Toast.LENGTH_SHORT).show();
                }
            }
        });

        cell.setOnLongClickListener(v -> {
            showIconShapePicker(label, packageName);
            return true;
        });
    }

    
    private void showIconShapePicker(String label, String packageName) {
        final String[] names = {
            "مستدير", "دائري", "مربع", "سداسي", "نجمة"
        };
        final String[] values = {
            "rounded", "circle", "square", "hexagon", "star"
        };

        android.content.SharedPreferences prefs =
            getSharedPreferences("launcher_prefs", MODE_PRIVATE);

        new AlertDialog.Builder(this)
            .setTitle("شكل أيقونة " + label)
            .setItems(names, (dialog, which) -> {
                prefs.edit()
                    .putString("icon_shape_" + packageName, values[which])
                    .apply();

                recreate();
            })
            .setNegativeButton("المزيد من التخصيص", (dialog, which) -> showIconEditor(label, packageName))
            .show();
    }

private void showIconEditor(String label, String packageName) {
        String[] options = {
            "اختيار صورة من المعرض",
            "تغيير لون خلفية الأيقونة",
            "تغيير شكل إطار الأيقونة",
            "تغيير حجم الأيقونة",
            favorites.contains(packageName) ? "إزالة من المفضلة" : "إضافة إلى المفضلة",
            "استعادة الأيقونة الأصلية"
        };

        new AlertDialog.Builder(this)
            .setTitle("تخصيص " + label)
            .setItems(options, (dialog, which) -> {
                if (which == 0) {
                    pendingIconPackage = packageName;
                    Intent pick = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    pick.addCategory(Intent.CATEGORY_OPENABLE);
                    pick.setType("image/*");
                    pick.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION |
                                  Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                    startActivityForResult(pick, PICK_ICON_REQUEST);
                } else if (which == 1) {
                    String[] colors = {"أبيض", "وردي", "لافندر", "خوخي", "نعناعي", "أسود"};
                    int[] values = {
                        Color.WHITE, 0xFFFFD6E5, 0xFFE2D7FF,
                        0xFFFFDFC9, 0xFFD8F2E2, Color.BLACK
                    };
                    new AlertDialog.Builder(this)
                        .setTitle("لون خلفية " + label)
                        .setItems(colors, (d, index) -> {
                            prefs.edit().putInt("icon_bg_" + packageName, values[index]).apply();
                            updateGrid();
                        }).show();
                } else if (which == 2) {
                    String[] shapes = {"دائري", "مستدير", "مربع"};
                    int[] radii = {100, 22, 6};
                    new AlertDialog.Builder(this)
                        .setTitle("شكل إطار " + label)
                        .setItems(shapes, (d, index) -> {
                            prefs.edit().putInt("icon_radius_" + packageName, radii[index]).apply();
                            updateGrid();
                        }).show();
                } else if (which == 3) {
                    String[] sizes = {"صغير", "متوسط", "كبير"};
                    int[] values = {40, 48, 58};
                    new AlertDialog.Builder(this)
                        .setTitle("حجم " + label)
                        .setItems(sizes, (d, index) -> {
                            prefs.edit().putInt("icon_size_" + packageName, values[index]).apply();
                            updateGrid();
                        }).show();
                } else if (which == 4) {
                    if (favorites.contains(packageName)) {
                        favorites.remove(packageName);
                    } else {
                        favorites.add(packageName);
                    }
                    prefs.edit().putStringSet("favorites", new HashSet<>(favorites)).apply();
                    updateGrid();
                } else if (which == 5) {
                    prefs.edit()
                        .remove("icon_uri_" + packageName)
                        .remove("icon_bg_" + packageName)
                        .remove("icon_radius_" + packageName)
                        .remove("icon_size_" + packageName)
                        .apply();
                    updateGrid();
                    Toast.makeText(this, "تمت استعادة الأيقونة الأصلية", Toast.LENGTH_SHORT).show();
                }
            }).show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == PICK_ICON_REQUEST && resultCode == RESULT_OK &&
            data != null && data.getData() != null && pendingIconPackage != null) {
            Uri uri = data.getData();
            try {
                getContentResolver().takePersistableUriPermission(
                    uri, Intent.FLAG_GRANT_READ_URI_PERMISSION
                );
                prefs.edit()
                    .putString("icon_uri_" + pendingIconPackage, uri.toString())
                    .apply();
                updateGrid();
                Toast.makeText(this, "تم حفظ صورة الأيقونة بشكل مستقل", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, "تعذر حفظ الصورة، حاول اختيار صورة أخرى", Toast.LENGTH_LONG).show();
            }
            pendingIconPackage = null;
        }
    }

    private void applyTheme(int index) {
        selectedTheme = index;
        prefs.edit().putInt("theme", index).apply();

        try {
            Bitmap wallpaper = Bitmap.createBitmap(720, 1600, Bitmap.Config.ARGB_8888);
            wallpaper.eraseColor(backgrounds[index]);
            WallpaperManager.getInstance(this).setBitmap(wallpaper);
            wallpaper.recycle();
        } catch (Exception e) {
            Toast.makeText(this, "تم حفظ الثيم، لكن تعذر تغيير الخلفية", Toast.LENGTH_SHORT).show();
        }

        buildScreen();
        Toast.makeText(this, "تم تطبيق ثيم " + themeNames[index], Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (clockView != null) {
            handler.removeCallbacks(clockTick);
            clockTick.run();
        }
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(clockTick);
        super.onDestroy();
    }
}
