'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Keyboard, Check, AlertCircle, Edit3, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { speechService } from '@/services/speechService';
import { KioskButton } from './KioskButton';
import { ClinicalQuestion } from '@/types/clinical';

interface InputModeProps {
  question: ClinicalQuestion;
  onSubmitAnswer?: (answer: string, mode: 'voice' | 'text' | 'touch') => void;
  onSubmit?: (answer: string, mode: 'voice' | 'text' | 'touch') => void;
  disabled?: boolean;
  isProcessing?: boolean;
  onListeningStateChange?: (isListening: boolean) => void;
}

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

  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const [isEditingTranscript, setIsEditingTranscript] = useState<boolean>(false);
  const [selectedTouchOption, setSelectedTouchOption] = useState<string | null>(null);

  // Voice auto-send countdown (2.5 seconds)
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset inputs when question changes
  useEffect(() => {
    stopListening();
    clearCountdown();
    setTranscript('');
    setTypedText('');
    setSpeechError('');
    setIsEditingTranscript(false);
    setSelectedTouchOption(null);
  }, [question.id]);

  const clearCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const handleStartListening = () => {
    clearCountdown();
    setSpeechError('');
    setTranscript('');
    setIsEditingTranscript(false);

    speechService.startListening(
      {
        onStart: () => {
          setIsListening(true);
          if (onListeningStateChange) onListeningStateChange(true);
        },
        onResult: (text) => {
          setTranscript(text);
        },
        onError: (err) => {
          setIsListening(false);
          setSpeechError(err);
          if (onListeningStateChange) onListeningStateChange(false);
        },
        onEnd: () => {
          setIsListening(false);
          if (onListeningStateChange) onListeningStateChange(false);
        },
      },
      language
    );
  };

  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
    if (onListeningStateChange) onListeningStateChange(false);
  };

  // When speech ends and we have transcript, start auto-confirm countdown
  useEffect(() => {
    if (!isListening && transcript.trim() && !isEditingTranscript && countdown === null) {
      setCountdown(3);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearCountdown();
            handleVoiceSubmit();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isListening, transcript, isEditingTranscript]);

  const handleVoiceSubmit = () => {
    clearCountdown();
    stopListening();
    if (transcript.trim()) {
      effectiveSubmit(transcript.trim(), 'voice');
      setTranscript('');
    }
  };

  const handleCancelCountdown = () => {
    clearCountdown();
    setIsEditingTranscript(true);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedText.trim()) {
      effectiveSubmit(typedText.trim(), 'text');
      setTypedText('');
    }
  };

  const handleTouchOptionSelect = (option: string) => {
    clearCountdown();
    stopListening();
    setSelectedTouchOption(option);
    // Instant save and advance
    effectiveSubmit(option, 'touch');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg space-y-6">
      {/* 1. Touch Quick Options (If question has predefined options or scale) */}
      {question.options && question.options.length > 0 && (
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            {t.conversation.orChooseOption}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt) => {
              const isSelected = selectedTouchOption === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTouchOptionSelect(opt)}
                  className={`p-4 sm:p-5 rounded-2xl font-bold text-lg text-left border-2 transition-all active:scale-[0.98] shadow-sm flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 scale-[1.01]'
                      : 'bg-sky-50/70 hover:bg-sky-100/90 text-kiosk-navy border-sky-200 hover:border-kiosk-blue'
                  }`}
                >
                  <span>{opt}</span>
                  <span
                    className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-sky-200 text-kiosk-blue'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1.B: Numeric Severity Scale (1 to 10) for Pain */}
      {question.questionType === 'scale' && (
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Select Pain Severity (1 = Mild, 10 = Severe):
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isHigh = num >= 7;
              const isMid = num >= 4 && num < 7;
              const isSelected = selectedTouchOption === `${num}/10 Severity`;

              return (
                <button
                  key={num}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTouchOptionSelect(`${num}/10 Severity`)}
                  className={`h-16 rounded-2xl font-black text-2xl transition active:scale-95 shadow-sm border-2 ${
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
        </div>
      )}

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-extrabold">
            Or Speak / Type Custom Answer
          </span>
        </div>
      </div>

      {/* Mode Switcher Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('voice');
              setSpeechError('');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              mode === 'voice'
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
              clearCountdown();
              stopListening();
              setMode('text');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              mode === 'text'
                ? 'bg-white text-kiosk-blue shadow-sm'
                : 'text-slate-600 hover:text-kiosk-navy'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Type Answer</span>
          </button>
        </div>

        {isListening && (
          <span className="text-sm font-bold text-rose-600 flex items-center gap-1.5 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            {t.conversation.listeningPrompt}
          </span>
        )}
      </div>

      {/* Speech Error Banner if any */}
      {speechError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-sm font-semibold flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{speechError} (You can switch to "Type Answer" above).</span>
        </div>
      )}

      {/* 2. VOICE INPUT MODE */}
      {mode === 'voice' && (
        <div className="space-y-4">
          {!isListening && !transcript ? (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
              <button
                type="button"
                disabled={disabled}
                onClick={handleStartListening}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-kiosk-blue to-kiosk-blue-dark text-white flex items-center justify-center shadow-kiosk-button hover:scale-105 active:scale-95 transition-all group"
              >
                <Mic className="w-12 h-12 group-hover:scale-110 transition-transform" />
              </button>
              <p className="text-lg font-bold text-kiosk-navy mt-4">{t.conversation.tapToSpeak}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Speak in English, தமிழ், or हिन्दी
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transcript Display Box */}
              <div className="p-5 bg-sky-50/70 border-2 border-kiosk-blue rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-kiosk-blue uppercase tracking-wider">
                    {isListening ? 'Live Voice Transcript:' : 'Recognized Answer:'}
                  </span>
                  {!isListening && transcript && (
                    <button
                      type="button"
                      onClick={() => {
                        clearCountdown();
                        setIsEditingTranscript(!isEditingTranscript);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-kiosk-blue flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingTranscript ? 'Done Editing' : 'Edit Transcript'}</span>
                    </button>
                  )}
                </div>

                {isEditingTranscript ? (
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-lg font-medium text-kiosk-navy bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
                    rows={3}
                  />
                ) : (
                  <p className="text-xl font-bold text-kiosk-navy leading-relaxed min-h-[50px]">
                    {transcript || (isListening ? 'Listening...' : 'No speech detected.')}
                  </p>
                )}
              </div>

              {/* Automatic Countdown Timer Banner */}
              {countdown !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-emerald-900 text-xs font-bold animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Auto-submitting in {countdown}s...</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelCountdown}
                    className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100"
                  >
                    Edit / Pause
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isListening ? (
                  <KioskButton
                    size="large"
                    variant="danger"
                    onClick={stopListening}
                    icon={<MicOff className="w-6 h-6" />}
                    className="w-full"
                  >
                    {t.conversation.stopAndSend}
                  </KioskButton>
                ) : (
                  <>
                    <KioskButton
                      variant="outline"
                      onClick={handleStartListening}
                      icon={<Mic className="w-5 h-5" />}
                      className="flex-1"
                    >
                      Re-record
                    </KioskButton>

                    <KioskButton
                      size="large"
                      variant="primary"
                      disabled={!transcript.trim()}
                      onClick={handleVoiceSubmit}
                      icon={<Send className="w-6 h-6" />}
                      className="flex-1"
                    >
                      {t.conversation.sendAnswer}
                    </KioskButton>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TEXT INPUT MODE */}
      {mode === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={t.conversation.typePlaceholder}
              disabled={disabled}
              rows={3}
              className="w-full p-5 text-xl font-medium text-kiosk-navy bg-slate-50 border-2 border-slate-300 rounded-2xl focus:bg-white focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 focus:outline-none transition placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end">
            <KioskButton
              type="submit"
              size="large"
              disabled={!typedText.trim() || disabled}
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
