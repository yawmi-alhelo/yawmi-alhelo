package com.yawmialhelo.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.bridge.getWebView().setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
        this.bridge.getWebView().setOnLongClickListener(new android.view.View.OnLongClickListener() {
            public boolean onLongClick(android.view.View v) {
                return true; // يمنع التحديد
            }
        });
    }
}
