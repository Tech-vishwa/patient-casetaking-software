'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AudioPromptButtonProps {
  textToSpeak: string;
  className?: string;
  label?: string;
}

export const AudioPromptButton: React.FC<AudioPromptButtonProps> = ({
  textToSpeak,
  className = '',
  label,
}) => {
  const { speakText, stopSpeaking, isSpeaking, t } = useLanguage();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(textToSpeak);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isSpeaking ? t.common.audioStop : t.common.audioGuide}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 ${
        isSpeaking
          ? 'bg-amber-500 text-white animate-pulse shadow-amber-200'
          : 'bg-kiosk-blue-light text-kiosk-blue-dark hover:bg-sky-200 border border-sky-300'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-5 h-5 text-white animate-bounce" />
          <span className="text-base font-bold">{t.common.audioStop}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-kiosk-blue-dark" />
          <span className="text-base font-bold">{label || t.common.audioGuide}</span>
        </>
      )}
    </button>
  );
};
