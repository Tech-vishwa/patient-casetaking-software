'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PreferredLanguage } from '@/types/patient';
import { TranslationDictionary, LanguageOption } from '@/types/i18n';
import { dictionaries, AVAILABLE_LANGUAGES, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: PreferredLanguage;
  setLanguage: (lang: PreferredLanguage) => void;
  t: TranslationDictionary;
  availableLanguages: LanguageOption[];
  speakText: (text: string, force?: boolean) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isVoiceGuidanceEnabled: boolean;
  toggleVoiceGuidance: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'medikiosk_pref_language';
const VOICE_GUIDANCE_KEY = 'medikiosk_voice_guidance_enabled';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<PreferredLanguage>('en');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceGuidanceEnabled, setIsVoiceGuidanceEnabled] = useState<boolean>(true);

  // Load language and voice guidance preference from local storage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as PreferredLanguage;
      if (savedLang && (savedLang === 'en' || savedLang === 'ta' || savedLang === 'hi')) {
        setLanguageState(savedLang);
      }
      const savedVoice = localStorage.getItem(VOICE_GUIDANCE_KEY);
      if (savedVoice !== null) {
        setIsVoiceGuidanceEnabled(savedVoice === 'true');
      }
    } catch {
      // Ignore storage errors on restricted environments
    }
  }, []);

  const setLanguage = (lang: PreferredLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  };

  const toggleVoiceGuidance = () => {
    setIsVoiceGuidanceEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(VOICE_GUIDANCE_KEY, String(next));
      } catch {}
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  };

  const t = getTranslation(language);

  // Web Speech API Voice Prompt Narration
  const speakText = (text: string, force: boolean = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any previous active or queued speech before starting new speech
    window.speechSynthesis.cancel();
    if (!text) return;

    // If automatic prompt and voice guidance is turned off, do not speak
    if (!force && !isVoiceGuidanceEnabled) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to BCP 47 language tag
    if (language === 'ta') {
      utterance.lang = 'ta-IN';
    } else if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.9; // Slower for elderly comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages: AVAILABLE_LANGUAGES,
        speakText,
        stopSpeaking,
        isSpeaking,
        isVoiceGuidanceEnabled,
        toggleVoiceGuidance,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
