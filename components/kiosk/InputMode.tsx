'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Keyboard, Check, AlertCircle, Edit3, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { speechService } from '@/services/speechService';
import { KioskButton } from './KioskButton';
import { ClinicalQuestion } from '@/types/clinical';
import { PreferredLanguage } from '@/types/patient';

interface InputModeProps {
  question: ClinicalQuestion;
  onSubmitAnswer?: (answer: string, mode: 'voice' | 'text' | 'touch') => void;
  onSubmit?: (answer: string, mode: 'voice' | 'text' | 'touch') => void;
  disabled?: boolean;
  isProcessing?: boolean;
  onListeningStateChange?: (isListening: boolean) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'review';

const REVIEW_TEXTS: Record<
  PreferredLanguage,
  {
    confirmQuestion: string;
    confirmBtn: string;
    editBtn: string;
    speakAgainBtn: string;
    noSpeech: string;
    processing: string;
    quickOptionsTitle: string;
    micUnavailable: string;
    orCustomDivider: string;
  }
> = {
  en: {
    confirmQuestion: 'Did we understand correctly?',
    confirmBtn: 'Confirm & Send',
    editBtn: 'Edit Text',
    speakAgainBtn: 'Speak Again',
    noSpeech: 'No speech detected. Please tap Speak again or choose a Quick Option above.',
    processing: 'Processing your answer...',
    quickOptionsTitle: 'Quick Options (Touch to Select):',
    micUnavailable: 'Microphone access is unavailable. You can type your answer or use Quick Options above.',
    orCustomDivider: 'Or Speak / Type Custom Answer',
  },
  ta: {
    confirmQuestion: 'நாங்கள் சரியாகப் புரிந்து கொண்டோமா?',
    confirmBtn: 'சரி, அனுப்புக',
    editBtn: 'மாற்றி எழுதுக',
    speakAgainBtn: 'மீண்டும் பேசுக',
    noSpeech: 'குரல் கேட்கவில்லை. மீண்டும் பேசவும் அல்லது மேலே உள்ள விரைவு விருப்பங்களைத் தேர்ந்தெடுக்கவும்.',
    processing: 'செயலாக்குகிறது...',
    quickOptionsTitle: 'விரைவு விருப்பங்கள் (தேர்ந்தெடுக்க தொடவும்):',
    micUnavailable: 'மைக்ரோஃபோன் அணுகல் கிடைக்கவில்லை. உங்கள் பதிலை தட்டச்சு செய்யலாம் அல்லது மேலே உள்ள விருப்பங்களை பயன்படுத்தலாம்.',
    orCustomDivider: 'அல்லது குரல் / தட்டச்சு மூலம் பதிலளிக்கவும்',
  },
  hi: {
    confirmQuestion: 'क्या हमने सही समझा?',
    confirmBtn: 'पुष्टि करें और भेजें',
    editBtn: 'संपादित करें',
    speakAgainBtn: 'फिर से बोलें',
    noSpeech: 'कोई आवाज नहीं पहचानी गई। कृपया फिर से बोलें या ऊपर दिए गए विकल्पों में से चुनें।',
    processing: 'उत्तर की प्रक्रिया जारी है...',
    quickOptionsTitle: 'त्वरित विकल्प (चुनने के लिए टैप करें):',
    micUnavailable: 'माइक्रोफ़ोन अनुपलब्ध है। आप अपना उत्तर टाइप कर सकते हैं या ऊपर दिए गए विकल्पों का उपयोग कर सकते हैं।',
    orCustomDivider: 'या बोलकर / टाइप करके उत्तर दें',
  },
};

const FALLBACK_OPTIONS: Record<PreferredLanguage, string[]> = {
  en: ['Yes', 'No', 'Not Sure', 'Other'],
  ta: ['ஆம் (Yes)', 'இல்லை (No)', 'உறுதியாக தெரியவில்லை (Not Sure)', 'மற்றவை (Other)'],
  hi: ['हाँ (Yes)', 'नहीं (No)', 'पक्का नहीं (Not Sure)', 'अन्य (Other)'],
};

export const InputMode: React.FC<InputModeProps> = ({
  question,
  onSubmitAnswer,
  onSubmit,
  disabled = false,
  isProcessing = false,
  onListeningStateChange,
}) => {
  const effectiveSubmit = onSubmitAnswer || onSubmit || (() => {});
  const effectiveDisabled = disabled || isProcessing;
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [selectedTouchOption, setSelectedTouchOption] = useState<string | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const localizedStrings = REVIEW_TEXTS[language] || REVIEW_TEXTS.en;

  // Determine available quick options
  const rawOptions = question.options && question.options.length > 0 ? question.options : null;
  const isScale = question.questionType === 'scale';
  const displayOptions = rawOptions || (!isScale ? (FALLBACK_OPTIONS[language] || FALLBACK_OPTIONS.en) : null);

  // Reset inputs when question changes
  useEffect(() => {
    stopListening();
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    setVoiceState('idle');
    setTranscript('');
    setTypedText('');
    setSpeechError('');
    setIsEditingTranscript(false);
    setSelectedTouchOption(null);
  }, [question.id]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const handleStartListening = () => {
    setSpeechError('');
    setTranscript('');
    setIsEditingTranscript(false);

    speechService.startListening(
      {
        onStart: () => {
          setVoiceState('listening');
          if (onListeningStateChange) onListeningStateChange(true);
        },
        onResult: (text) => {
          setTranscript(text);
        },
        onError: (err) => {
          setVoiceState('idle');
          setSpeechError(localizedStrings.micUnavailable);
          if (onListeningStateChange) onListeningStateChange(false);
        },
        onEnd: () => {
          if (onListeningStateChange) onListeningStateChange(false);
          // Transition to processing then review if transcript captured
          setVoiceState((current) => {
            if (current === 'listening') {
              return 'processing';
            }
            return current;
          });

          // Short delay to show processing feedback then review
          processingTimeoutRef.current = setTimeout(() => {
            setTranscript((latestTranscript) => {
              if (latestTranscript.trim()) {
                setVoiceState('review');
              } else {
                setVoiceState('idle');
              }
              return latestTranscript;
            });
          }, 350);
        },
      },
      language
    );
  };

  const stopListening = () => {
    speechService.stopListening();
    if (onListeningStateChange) onListeningStateChange(false);
  };

  const handleDoneSpeaking = () => {
    stopListening();
    setVoiceState('processing');

    processingTimeoutRef.current = setTimeout(() => {
      if (transcript.trim()) {
        setVoiceState('review');
      } else {
        setVoiceState('idle');
        setSpeechError(localizedStrings.noSpeech);
      }
    }, 350);
  };

  const handleConfirmVoice = () => {
    if (transcript.trim() && !effectiveDisabled) {
      effectiveSubmit(transcript.trim(), 'voice');
      setTranscript('');
      setVoiceState('idle');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedText.trim() && !effectiveDisabled) {
      effectiveSubmit(typedText.trim(), 'text');
      setTypedText('');
    }
  };

  const handleTouchOptionSelect = (option: string) => {
    if (effectiveDisabled) return;
    stopListening();
    setVoiceState('idle');
    setSelectedTouchOption(option);
    effectiveSubmit(option, 'touch');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-xl space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. QUICK OPTIONS (TOUCH / TAP) — PLACED ABOVE VOICE INPUT     */}
      {/* ------------------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-amber-500">⚡</span>
            <span>{localizedStrings.quickOptionsTitle}</span>
          </p>
          <span className="text-[11px] font-bold text-slate-400">Tap one to answer instantly</span>
        </div>

        {/* 1.A: Predefined / Fallback Option Chips */}
        {displayOptions && displayOptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {displayOptions.map((opt) => {
              const isSelected = selectedTouchOption === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={effectiveDisabled}
                  onClick={() => handleTouchOptionSelect(opt)}
                  className={`p-4 rounded-2xl font-bold text-base sm:text-lg text-left border-2 transition-all active:scale-[0.98] shadow-sm flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 scale-[1.01]'
                      : 'bg-slate-50 hover:bg-sky-50 text-kiosk-navy border-slate-200 hover:border-kiosk-blue'
                  }`}
                >
                  <span className="leading-snug">{opt}</span>
                  <span
                    className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-300 text-slate-400 group-hover:text-kiosk-blue'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 1.B: Numeric Severity Scale (1 to 10) for Pain Questions */}
        {isScale && (
          <div className="space-y-2">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isHigh = num >= 7;
                const isMid = num >= 4 && num < 7;
                const isSelected = selectedTouchOption === `${num}/10 Severity`;

                return (
                  <button
                    key={num}
                    type="button"
                    disabled={effectiveDisabled}
                    onClick={() => handleTouchOptionSelect(`${num}/10 Severity`)}
                    className={`h-14 sm:h-16 rounded-2xl font-black text-xl sm:text-2xl transition active:scale-95 shadow-sm border-2 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                        : isHigh
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white'
                        : isMid
                        ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-500 hover:text-white'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
              <span>1 = Mild</span>
              <span>5 = Moderate</span>
              <span>10 = Severe</span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-extrabold tracking-wider">
            {localizedStrings.orCustomDivider}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. INPUT METHOD TABS (Voice Input vs Type Answer)             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('voice');
              setSpeechError('');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'voice'
                ? 'bg-white text-kiosk-blue shadow-sm'
                : 'text-slate-600 hover:text-kiosk-navy'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Input</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopListening();
              setVoiceState('idle');
              setActiveTab('text');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'text'
                ? 'bg-white text-kiosk-blue shadow-sm'
                : 'text-slate-600 hover:text-kiosk-navy'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Type Answer</span>
          </button>
        </div>

        {voiceState === 'listening' && (
          <span className="text-sm font-bold text-rose-600 flex items-center gap-2 animate-pulse">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            {t.conversation.listeningPrompt}
          </span>
        )}
      </div>

      {/* Speech Error / Permission Banner */}
      {speechError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{speechError}</p>
            <p className="text-xs text-amber-700 font-medium mt-1">
              Tap any Quick Option above or select &quot;Type Answer&quot; to continue.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PRIMARY TAB CONTENT: VOICE INPUT                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'voice' && (
        <div>
          {/* STATE 1: IDLE / READY TO SPEAK */}
          {voiceState === 'idle' && (
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-50/50 to-slate-50 rounded-2xl border-2 border-dashed border-sky-200 text-center">
              <button
                type="button"
                disabled={effectiveDisabled}
                onClick={handleStartListening}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-kiosk-blue to-kiosk-blue-dark text-white flex items-center justify-center shadow-kiosk-button hover:scale-105 active:scale-95 transition-all group focus:outline-none focus:ring-4 focus:ring-sky-200"
              >
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform" />
              </button>
              <p className="text-lg font-black text-kiosk-navy mt-4">{t.conversation.tapToSpeak}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Speak in English, தமிழ், or हिन्दी
              </p>
            </div>
          )}

          {/* STATE 2: LISTENING */}
          {voiceState === 'listening' && (
            <div className="p-6 bg-rose-50/60 border-2 border-rose-300 rounded-2xl space-y-4 text-center animate-in fade-in">
              <div className="flex items-center justify-center gap-2 text-rose-600 font-black text-lg">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
                <span>Listening... Speak now</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-rose-200 min-h-[60px] flex items-center justify-center">
                <p className="text-xl font-bold text-kiosk-navy">
                  {transcript || (
                    <span className="text-slate-400 italic font-medium">Listening to your voice...</span>
                  )}
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <KioskButton
                  size="large"
                  variant="danger"
                  onClick={handleDoneSpeaking}
                  icon={<MicOff className="w-6 h-6" />}
                  className="w-full sm:w-auto min-w-[220px]"
                >
                  Done Speaking
                </KioskButton>
              </div>
            </div>
          )}

          {/* STATE 3: PROCESSING */}
          {voiceState === 'processing' && (
            <div className="p-8 bg-sky-50/50 border-2 border-sky-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-kiosk-blue animate-spin" />
              <p className="text-base font-bold text-kiosk-navy">{localizedStrings.processing}</p>
            </div>
          )}

          {/* STATE 4: REVIEW & CONFIRM */}
          {voiceState === 'review' && (
            <div className="p-6 bg-sky-50/80 border-2 border-kiosk-blue rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-kiosk-blue" />
                  <span className="text-sm font-black text-kiosk-blue uppercase tracking-wider">
                    {localizedStrings.confirmQuestion}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-xs font-bold text-slate-600 hover:text-kiosk-blue flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingTranscript ? 'Done Editing' : localizedStrings.editBtn}</span>
                </button>
              </div>

              {isEditingTranscript ? (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-kiosk-blue text-xl font-bold text-kiosk-navy bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                  rows={3}
                />
              ) : (
                <div className="p-4 bg-white rounded-xl border border-sky-200 shadow-sm">
                  <p className="text-xl font-bold text-kiosk-navy leading-relaxed">
                    &quot;{transcript}&quot;
                  </p>
                </div>
              )}

              {/* 3 Review Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartListening}
                  className="py-3.5 px-4 rounded-xl font-bold text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>{localizedStrings.speakAgainBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTypedText(transcript);
                    setActiveTab('text');
                    setVoiceState('idle');
                  }}
                  className="py-3.5 px-4 rounded-xl font-bold text-sm text-sky-800 bg-sky-100 border border-sky-200 hover:bg-sky-200 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Keyboard className="w-4 h-4 text-sky-700" />
                  <span>Type / Edit</span>
                </button>

                <button
                  type="button"
                  disabled={!transcript.trim() || effectiveDisabled}
                  onClick={handleConfirmVoice}
                  className="py-3.5 px-4 rounded-xl font-black text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{localizedStrings.confirmBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3.B SECONDARY TAB CONTENT: TEXT INPUT (KEYBOARD)              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={t.conversation.typePlaceholder}
              disabled={effectiveDisabled}
              rows={3}
              className="w-full p-4 sm:p-5 text-xl font-medium text-kiosk-navy bg-slate-50 border-2 border-slate-300 rounded-2xl focus:bg-white focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 focus:outline-none transition placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end">
            <KioskButton
              type="submit"
              size="large"
              disabled={!typedText.trim() || effectiveDisabled}
              icon={<Send className="w-6 h-6" />}
              className="w-full sm:w-auto min-w-[220px]"
            >
              {t.conversation.sendAnswer}
            </KioskButton>
          </div>
        </form>
      )}
    </div>
  );
};
