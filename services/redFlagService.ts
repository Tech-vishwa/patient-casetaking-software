export interface RedFlagRule {
  id: string;
  category: 'CHEST_EMERGENCY' | 'STROKE_SYMPTOMS' | 'ACUTE_RESPIRATORY' | 'SEVERE_BLEEDING' | 'ALTERED_CONSCIOUSNESS';
  severity: 'critical' | 'high' | 'moderate';
  keywords: string[]; // multi-lingual triggers
  description: string;
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'rf_chest_severe',
    category: 'CHEST_EMERGENCY',
    severity: 'critical',
    keywords: [
      'chest pain', 'crushing chest', 'heart attack', 'pain in chest', 'left arm pain', 'sweating with chest pain',
      'நெஞ்சு வலி', 'மார்பு வலி', 'இதய வலி',
      'सीने में दर्द', 'छाती में दर्द', 'दिल का दौरा'
    ],
    description: 'Potential Acute Coronary / Cardiac event symptoms reported.',
  },
  {
    id: 'rf_stroke_fast',
    category: 'STROKE_SYMPTOMS',
    severity: 'critical',
    keywords: [
      'sudden weakness', 'face drooping', 'facial drooping', 'slurred speech', 'cannot speak', 'arm numbness', 'sudden paralysis',
      'முகம் ஒருபுறம் சாய்ந்தது', 'பேச முடியவில்லை', 'திடீர் பலவீனம்',
      'अचानक कमजोरी', 'बोलने में कठिनाई', 'चेहरा टेढ़ा होना', 'अचानक पक्षाघात'
    ],
    description: 'Potential Acute Stroke / Neurological deficit reported.',
  },
  {
    id: 'rf_respiratory_acute',
    category: 'ACUTE_RESPIRATORY',
    severity: 'critical',
    keywords: [
      'cannot breathe', 'severe breathing difficulty', 'gasping for air', 'choking', 'blue lips', 'severe breathlessness',
      'மூச்சுத் திணறல்', 'மூச்சு விட முடியவில்லை', 'சுவாசிக்க சிரமம்',
      'सांस नहीं आ रही', 'गंभीर सांस की तकलीफ', 'सांस फूलना'
    ],
    description: 'Potential Acute Respiratory Distress reported.',
  },
  {
    id: 'rf_severe_bleeding',
    category: 'SEVERE_BLEEDING',
    severity: 'critical',
    keywords: [
      'uncontrolled bleeding', 'coughing blood', 'vomiting blood', 'heavy blood loss', 'severe hemorrhage',
      'அதிக ரத்தப்போக்கு', 'ரத்தம் வாந்தி', 'ரத்தக் கசிவு',
      'रक्तस्राव', 'खून की उल्टी', 'अत्यधिक खून बहना'
    ],
    description: 'Severe uncontrolled bleeding or hematemesis reported.',
  },
  {
    id: 'rf_loss_consciousness',
    category: 'ALTERED_CONSCIOUSNESS',
    severity: 'high',
    keywords: [
      'fainted', 'loss of consciousness', 'blacked out', 'unresponsive', 'convulsions', 'seizure',
      'மயக்கம்', 'நினைவிழந்தது', 'வலிப்பு',
      'बेहोश', 'मूर्छित', 'दौरा पड़ना'
    ],
    description: 'Altered mental status, syncope, or seizure activity reported.',
  }
];

export interface RedFlagDetectionResult {
  hasRedFlag: boolean;
  matchedRules: RedFlagRule[];
  matchedKeywords: string[];
}

export class RedFlagService {
  /**
   * Deterministic pattern matcher across patient input (Chief complaint, HPI answers)
   */
  static evaluate(text: string): RedFlagDetectionResult {
    if (!text || text.trim().length === 0) {
      return { hasRedFlag: false, matchedRules: [], matchedKeywords: [] };
    }

    const normalized = text.toLowerCase();
    const matchedRules: RedFlagRule[] = [];
    const matchedKeywords: string[] = [];

    for (const rule of RED_FLAG_RULES) {
      for (const kw of rule.keywords) {
        if (normalized.includes(kw.toLowerCase())) {
          if (!matchedRules.some(r => r.id === rule.id)) {
            matchedRules.push(rule);
          }
          if (!matchedKeywords.includes(kw)) {
            matchedKeywords.push(kw);
          }
        }
      }
    }

    return {
      hasRedFlag: matchedRules.length > 0,
      matchedRules,
      matchedKeywords,
    };
  }
}
