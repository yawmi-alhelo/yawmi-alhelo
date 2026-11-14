import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-rose-50 dark:bg-[#1a1a24] p-6 flex flex-col items-center justify-center text-center">
          <p className="text-6xl mb-4">🌸</p>
          <h1 className="text-xl font-extrabold text-rose-500 mb-2">صار خطأ صغير</h1>
          <p className="text-sm text-ink-700 dark:text-rose-200 mb-4 max-w-sm">
            التطبيق صادف خطأ تقني، بس بياناتج محفوظة. جرّبي تحديث الصفحة.
          </p>
          <pre className="text-xs bg-white dark:bg-[#252532] text-rose-600 rounded-xl2 p-3 max-w-full overflow-x-auto text-left mb-4 max-h-40">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            className="bg-rose-400 text-white rounded-xl2 px-6 py-3 font-bold"
          >
            رجوع للرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
