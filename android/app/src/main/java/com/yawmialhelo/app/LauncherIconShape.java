package com.yawmialhelo.app;

import android.graphics.Outline;
import android.graphics.Path;
import android.os.Build;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.ImageView;

public final class LauncherIconShape {
    private LauncherIconShape() {}

    public static void apply(ImageView view, String shape, float radius) {
        if (view == null) return;

        view.setClipToOutline(true);
        view.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View v, Outline outline) {
                int w = v.getWidth();
                int h = v.getHeight();
                if (w <= 0 || h <= 0) return;

                float size = Math.min(w, h);
                float left = (w - size) / 2f;
                float top = (h - size) / 2f;
                String type = shape == null ? "rounded" : shape;

                if ("circle".equals(type)) {
                    outline.setOval((int)left, (int)top,
                        (int)(left + size), (int)(top + size));
                } else if ("square".equals(type)) {
                    outline.setRect((int)left, (int)top,
                        (int)(left + size), (int)(top + size));
                } else if (Build.VERSION.SDK_INT >= 30 &&
                        ("hexagon".equals(type) || "star".equals(type))) {
                    Path path = new Path();
                    float cx = w / 2f, cy = h / 2f, r = size / 2f;
                    int count = "star".equals(type) ? 10 : 6;

                    for (int i = 0; i < count; i++) {
                        double angle = Math.PI * 2 * i / count - Math.PI / 2;
                        float current = "star".equals(type) && i % 2 == 1
                            ? r * 0.48f : r;
                        float x = cx + (float)(current * Math.cos(angle));
                        float y = cy + (float)(current * Math.sin(angle));
                        if (i == 0) path.moveTo(x, y);
                        else path.lineTo(x, y);
                    }
                    path.close();
                    outline.setConvexPath(path);
                } else {
                    float corner = radius > 0 ? radius : size * 0.22f;
                    outline.setRoundRect((int)left, (int)top,
                        (int)(left + size), (int)(top + size), corner);
                }
            }
        });
        view.invalidateOutline();
    }
}
