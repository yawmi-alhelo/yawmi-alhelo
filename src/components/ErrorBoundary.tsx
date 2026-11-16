import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div dir="rtl" style={{ padding: 24, fontFamily: "Cairo, sans-serif", textAlign: "center", color: "#fff", background: "#121212", minHeight: "100vh" }}>
          <h1 style={{ fontSize: 22, marginBottom: 12, color: "#ec4899" }}>حدث خطأ غير متوقع</h1>
          <p style={{ color: "#aaa", marginBottom: 20 }}>لا تقلق، بياناتك في أمان.<br/><span style={{color: '#ff6b6b', fontSize: 12}}>{this.state.error?.message}</span></p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} style={{ padding: "10px 18px", borderRadius: 8, background: "#ec4899", color: "#fff", border: "none", fontWeight: "bold" }}>تحديث الصفحة</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
