import { Capacitor } from '@capacitor/core';
import type { SpeechRecognitionPlugin, WebSpeechRecognition, WebSpeechResultEvent } from '../types/voice';

export interface VoiceCallbacks {
  onPartial?: (text: string) => void;
  onResult: (text: string) => void;
  onError: (err: string) => void;
  onEnd?: () => void;
}

let webRecognition: WebSpeechRecognition | null = null;
let nativeListeners: Array<{ remove: () => Promise<void> }> = [];
let nativePlugin: SpeechRecognitionPlugin | null = null;

async function getNativePlugin(): Promise<SpeechRecognitionPlugin> {
  if (nativePlugin) return nativePlugin;
  const mod = await import('@capacitor-community/speech-recognition');
  nativePlugin = mod.SpeechRecognition as unknown as SpeechRecognitionPlugin;
  return nativePlugin;
}

function errMsg(e: unknown): string { return e instanceof Error ? e.message : String(e); }

export async function isVoiceAvailable(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) return true;
    return typeof window !== 'undefined' && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));
  } catch { return false; }
}

export async function requestVoicePermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const SR = await getNativePlugin();
      const p = await SR.checkPermissions();
      const status = p.speechRecognition || p.microphone || p.permission;
      if (status === 'granted') return true;
      const req = await SR.requestPermissions();
      const s2 = req.speechRecognition || req.microphone || req.permission;
      return s2 === 'granted';
    }
    return true;
  } catch (e) { console.warn('[voice] perm', errMsg(e)); return false; }
}

export async function startListening(cb: VoiceCallbacks, lang = 'ar-IQ'): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const SR = await getNativePlugin();
      for (const l of nativeListeners) { try { await l.remove(); } catch { /* ignore */ } }
      nativeListeners = [];
      const partial = await SR.addListener('partialResults', (data) => {
        if (data.matches?.[0] && cb.onPartial) cb.onPartial(data.matches[0]);
      });
      const state = await SR.addListener('listeningState', (data) => {
        if (data.status === 'stopped' && cb.onEnd) cb.onEnd();
      });
      nativeListeners.push(partial, state);
      const result = await SR.start({ language: lang, maxResults: 1, prompt: 'هلا، تحدثي شتريدين تسوين اليوم', partialResults: true, popup: false });
      if (result.matches?.[0]) cb.onResult(result.matches[0]);
    } else {
      const Ctor = (window.SpeechRecognition || window.webkitSpeechRecognition) as (new () => WebSpeechRecognition) | undefined;
      if (!Ctor) { cb.onError('المتصفح ما يدعم الإدخال الصوتي'); return; }
      const rec = new Ctor();
      webRecognition = rec;
      rec.lang = lang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (ev: WebSpeechResultEvent) => {
        const results = Array.from({ length: ev.results.length }, (_, i) => ev.results[i]);
        const text = results.map(r => r[0].transcript).join(' ');
        const final = results[results.length - 1]?.isFinal;
        if (final) cb.onResult(text);
        else if (cb.onPartial) cb.onPartial(text);
      };
      rec.onerror = (ev) => cb.onError(ev.error || 'خطأ في التسجيل');
      rec.onend = () => cb.onEnd?.();
      try { rec.start(); } catch (e) { cb.onError(errMsg(e)); }
    }
  } catch (e) { cb.onError(errMsg(e)); }
}

export async function stopListening(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const SR = await getNativePlugin();
      await SR.stop();
      for (const l of nativeListeners) { try { await l.remove(); } catch { /* ignore */ } }
      nativeListeners = [];
    } else if (webRecognition) { webRecognition.stop(); webRecognition = null; }
  } catch { /* ignore */ }
}
