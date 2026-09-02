import { PreferredLanguage } from '@/types/patient';
import { TranslationDictionary, LanguageOption } from '@/types/i18n';
import { en } from './en';
import { ta } from './ta';
import { hi } from './hi';

export const dictionaries: Record<PreferredLanguage, TranslationDictionary> = {
  en,
  ta,
  hi,
};

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
  },
];

export function getTranslation(lang: PreferredLanguage): TranslationDictionary {
  return dictionaries[lang] || dictionaries.en;
}
