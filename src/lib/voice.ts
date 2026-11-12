import { Capacitor } from '@capacitor/core';

export interface VoiceCallbacks {
  onPartial?: (text: string) => void;
  onResult: (text: string) => void;
  onError: (err: string) => void;
  onEnd?: () => void;
}

let webRecognition: any = null;
let nativeListeners: any[] = [];
let nativePlugin: any = null;

async function getNativePlugin() {
  if (nativePlugin) return nativePlugin;
  const mod: any = await import('@capacitor-community/speech-recognition');
  nativePlugin = mod.SpeechRecognition;
  return nativePlugin;
}

export async function isVoiceAvailable(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      // على APK: نفترض متوفر — نتحقق عند الضغط
      return true;
    }
    return typeof window !== 'undefined'
      && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));
  } catch {
    return false;
  }
}

export async function requestVoicePermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const SR = await getNativePlugin();
      const p: any = await SR.checkPermissions();
      const status = p.speechRecognition || p.microphone || p.permission;
      if (status === 'granted') return true;
      const req: any = await SR.requestPermissions();
      const s2 = req.speechRecognition || req.microphone || req.permission;
      return s2 === 'granted';
    }
    return true;
  } catch (e) {
    console.warn('[voice] perm', e);
    return false;
  }
}

export async function startListening(cb: VoiceCallbacks, lang = 'ar-IQ'): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const SR = await getNativePlugin();
      for (const l of nativeListeners) { try { await l.remove(); } catch {} }
      nativeListeners = [];

      const partial = await SR.addListener('partialResults', (data: any) => {
        if (data?.matches?.[0] && cb.onPartial) cb.onPartial(data.matches[0]);
      });
      const state = await SR.addListener('listeningState', (data: any) => {
        if (data?.status === 'stopped' && cb.onEnd) cb.onEnd();
      });
      nativeListeners.push(partial, state);

      const result: any = await SR.start({
        language: lang,
        maxResults: 1,
        prompt: 'هلا، تحدثي شتريدين تسوين اليوم',
        partialResults: true,
        popup: false,
      });
      if (result?.matches?.[0]) cb.onResult(result.matches[0]);
    } else {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { cb.onError('المتصفح ما يدعم الإدخال الصوتي'); return; }
      webRecognition = new SR();
      webRecognition.lang = lang;
      webRecognition.interimResults = true;
      webRecognition.continuous = false;
      webRecognition.onresult = (ev: any) => {
        const results = Array.from(ev.results) as any[];
        const text = results.map(r => r[0].transcript).join(' ');
        const final = results[results.length - 1]?.isFinal;
        if (final) cb.onResult(text);
        else if (cb.onPartial) cb.onPartial(text);
      };
      webRecognition.onerror = (ev: any) => cb.onError(ev.error || 'خطأ في التسجيل');
      webRecognition.onend = () => cb.onEnd?.();
      try { webRecognition.start(); } catch (e: any) { cb.onError(e?.message || 'فشل بدء التسجيل'); }
    }
  } catch (e: any) {
    cb.onError(e?.message || 'فشل بدء التسجيل');
  }
}

export async function stopListening(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const SR = await getNativePlugin();
      await SR.stop();
      for (const l of nativeListeners) { try { await l.remove(); } catch {} }
      nativeListeners = [];
    } else if (webRecognition) {
      webRecognition.stop();
      webRecognition = null;
    }
  } catch {}
}
