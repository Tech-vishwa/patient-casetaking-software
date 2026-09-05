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
  isListening(): boolean;
}

/**
 * Browser Web Speech API Speech Recognition Adapter
 * Extensible for Indian languages (en-IN, ta-IN, hi-IN) with fallback and permission handling.
 */
export class BrowserSpeechService implements ISpeechService {
  private recognition: any = null;
  private currentTranscript: string = '';
  private isListeningState: boolean = false;
  private currentLanguage: string = 'en-IN';
  private activeListener: SpeechRecognitionListener | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): boolean {
    if (typeof window === 'undefined') return false;

    if (this.recognition) return true;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Complete utterance mode for reliable kiosk response
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;
        return true;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
        this.recognition = null;
        return false;
      }
    }
    return false;
  }

  isSupported(): boolean {
    return this.initRecognition();
  }

  isListening(): boolean {
    return this.isListeningState;
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
    this.activeListener = listener;

    if (languageCode) {
      this.setLanguage(languageCode);
    }

    if (!this.initRecognition() || !this.recognition) {
      if (listener.onError) {
        listener.onError('Microphone access is unavailable. You can type your answer or use Quick Options.');
      }
      return;
    }

    // If already listening, stop before starting anew
    if (this.isListeningState) {
      try {
        this.recognition.abort();
      } catch {}
      this.isListeningState = false;
    }

    this.currentTranscript = '';

    this.recognition.onstart = () => {
      this.isListeningState = true;
      if (this.activeListener?.onStart) {
        this.activeListener.onStart();
      }
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

      if (this.activeListener?.onResult) {
        this.activeListener.onResult(this.currentTranscript, Boolean(finalTranscript));
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListeningState = false;
      let errorMsg = `Speech recognition error: ${event.error}`;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Microphone access is unavailable. You can type your answer or use Quick Options.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please tap the microphone and speak again, or use Quick Options.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error during voice recognition. You can type your answer or use Quick Options.';
      }

      if (this.activeListener?.onError) {
        this.activeListener.onError(errorMsg);
      }
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      if (this.activeListener?.onEnd) {
        this.activeListener.onEnd();
      }
    };

    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch (err: any) {
      this.isListeningState = false;
      const message = err.name === 'NotAllowedError'
        ? 'Microphone access is unavailable. You can type your answer or use Quick Options.'
        : (err.message || 'Could not start speech recognition. Please use Quick Options.');
      if (listener.onError) {
        listener.onError(message);
      }
    }
  }

  stopListening(): void {
    if (this.recognition) {
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
