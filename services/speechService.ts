export interface SpeechRecognitionListener {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface ISpeechService {
  isSupported(): boolean;
  startListening(listener: SpeechRecognitionListener, language?: string): void;
  stopListening(): void;
  getTranscript(): string;
  setLanguage(language: string): void;
}

/**
 * Browser Web Speech API Speech Recognition Adapter
 * Extensible for Indian languages and modular for future Bhashini / Whisper adapters.
 */
export class BrowserSpeechService implements ISpeechService {
  private recognition: any = null;
  private currentTranscript: string = '';
  private isListeningState: boolean = false;
  private currentLanguage: string = 'en-IN';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  setLanguage(languageCode: string): void {
    if (languageCode === 'ta') {
      this.currentLanguage = 'ta-IN';
    } else if (languageCode === 'hi') {
      this.currentLanguage = 'hi-IN';
    } else {
      this.currentLanguage = 'en-IN';
    }

    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  startListening(listener: SpeechRecognitionListener, languageCode?: string): void {
    if (languageCode) {
      this.setLanguage(languageCode);
    }

    if (!this.recognition) {
      if (listener.onError) {
        listener.onError('Speech recognition is not supported in this browser. Please use text input or touchscreen.');
      }
      return;
    }

    if (this.isListeningState) {
      return;
    }

    this.currentTranscript = '';

    this.recognition.onstart = () => {
      this.isListeningState = true;
      if (listener.onStart) listener.onStart();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullCurrent = (finalTranscript || interimTranscript).trim();
      if (fullCurrent) {
        this.currentTranscript = fullCurrent;
      }

      if (listener.onResult) {
        listener.onResult(this.currentTranscript, Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListeningState = false;
      const errorMsg = event.error === 'not-allowed'
        ? 'Microphone permission was denied. Please allow microphone access or switch to text input.'
        : `Speech recognition error: ${event.error}`;
      if (listener.onError) listener.onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      if (listener.onEnd) listener.onEnd();
    };

    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch (err: any) {
      this.isListeningState = false;
      if (listener.onError) listener.onError(err.message || 'Could not start speech recognition');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListeningState = false;
    }
  }

  getTranscript(): string {
    return this.currentTranscript;
  }
}

export const speechService = new BrowserSpeechService();
