export interface SpeechRecognitionEvent { matches?: string[]; status?: string; }
export interface ListenerHandle { remove: () => Promise<void>; }
export interface SpeechRecognitionPlugin {
  available?: () => Promise<{ available: boolean }>;
  checkPermissions: () => Promise<{ speechRecognition?: string; microphone?: string; permission?: string }>;
  requestPermissions: () => Promise<{ speechRecognition?: string; microphone?: string; permission?: string }>;
  start: (opts: { language: string; maxResults: number; prompt: string; partialResults: boolean; popup: boolean }) => Promise<{ matches?: string[] }>;
  stop: () => Promise<void>;
  addListener: (event: 'partialResults' | 'listeningState', cb: (data: SpeechRecognitionEvent) => void) => Promise<ListenerHandle>;
}
export interface WebSpeechAlternative { transcript: string; }
export interface WebSpeechResultItem { isFinal: boolean; 0: WebSpeechAlternative; }
export interface WebSpeechResults { length: number; [index: number]: WebSpeechResultItem; }
export interface WebSpeechResultEvent { results: WebSpeechResults; }
export interface WebSpeechRecognition extends EventTarget {
  lang: string; interimResults: boolean; continuous: boolean;
  start(): void; stop(): void;
  onresult: ((ev: WebSpeechResultEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
export type WebSpeechRecognitionCtor = new () => WebSpeechRecognition;
declare global {
  interface Window { SpeechRecognition?: WebSpeechRecognitionCtor; webkitSpeechRecognition?: WebSpeechRecognitionCtor; }
}
