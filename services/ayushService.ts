import { PreferredLanguage } from '@/types/patient';
import {
  AyushStage,
  AyushAssessment,
  CreateAyushAssessmentInput,
  PrakritiAssessment,
  VikritiAssessment,
  AharaAssessment,
  ViharaAssessment,
  DashavidhaPariksha,
} from '@/types/ayush';
import { ClinicalQuestion } from '@/types/clinical';
import { mockDb } from '@/lib/supabase/mockDb';

interface AyushQuestionTemplate {
  id: string;
  stage: AyushStage;
  question: Record<PreferredLanguage, string>;
  questionType: 'text' | 'multiple_choice' | 'scale' | 'yes_no_unsure';
  options?: Record<PreferredLanguage, string[]>;
  fieldKey: string;
}

export class AyushService {
  /**
   * Question Bank for AYUSH / Ayurveda Consultation across EN, TA, HI
   */
  static readonly AYUSH_QUESTIONS: Record<AyushStage, AyushQuestionTemplate[]> = {
    presenting_complaint: [
      {
        id: 'ayush_main_complaint',
        stage: 'presenting_complaint',
        question: {
          en: 'Namaste. What main health problem or discomfort brings you to the Ayurvedic clinic today?',
          ta: 'வணக்கம். இன்று நீங்கள் ஆயுர்வேத மருத்துவமனைக்கு வரக் காரணமான முக்கிய உடல்நலப் பிரச்சனை என்ன?',
          hi: 'नमस्ते। आज आपको आयुर्वेदिक ओपीडी में किस मुख्य स्वास्थ्य समस्या या बेचैनी के लिए आना पड़ा है?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Digestive Problem', 'Joint Pain / Stiffness', 'Skin Problem', 'Sleep Problem', 'Stress / Fatigue', 'Other'],
          ta: ['செரிமானப் பிரச்சனை', 'மூட்டு வலி / விறைப்பு', 'தோல் பிரச்சனை', 'தூக்கமின்மை', 'மன அழுத்தம் / சோர்வு', 'பிற'],
          hi: ['पाचन समस्या', 'जोड़ों का दर्द / अकड़न', 'त्वचा समस्या', 'नींद की समस्या', 'तनाव / थकान', 'अन्य'],
        },
        fieldKey: 'presenting_complaint',
      },
      {
        id: 'ayush_duration',
        stage: 'presenting_complaint',
        question: {
          en: 'How long have you been experiencing this health problem?',
          ta: 'இந்த உடல்நலப் பிரச்சனை எத்தனை நாட்களாக அல்லது மாதங்களாக உள்ளது?',
          hi: 'यह स्वास्थ्य समस्या आपको कितने समय से (दिन, सप्ताह या महीने) हो रही है?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Just started (< 1 week)', '1 to 4 weeks', '1 to 6 months', 'More than 6 months (chronic)'],
          ta: ['சமீபத்தில் தொடங்கியது (1 வாரத்திற்குள்)', '1 முதல் 4 வாரங்கள்', '1 முதல் 6 மாதங்கள்', '6 மாதங்களுக்கும் மேல் (நீண்டகாலமாக)'],
          hi: ['हाल ही में शुरू हुई (< 1 सप्ताह)', '1 से 4 सप्ताह', '1 से 6 महीने', '6 महीने से अधिक समय से (दीर्घकालिक)'],
        },
        fieldKey: 'duration',
      },
      {
        id: 'ayush_prev_treatment',
        stage: 'presenting_complaint',
        question: {
          en: 'Have you taken any previous medicines, home remedies, or treatments for this complaint?',
          ta: 'இந்த பிரச்சனைக்கு இதற்கு முன் ஏதேனும் சிகிச்சைகள் அல்லது மருந்துகள் எடுத்துள்ளீர்களா?',
          hi: 'क्या आपने इस समस्या के लिए पहले कोई दवाई, घरेलू नुस्खा या उपचार लिया है?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['None / No previous treatment', 'Modern / Allopathic medicines', 'Ayurvedic / Herbal remedies', 'Other'],
          ta: ['முந்தைய சிகிச்சை எதுவும் இல்லை', 'ஆங்கில / அலோபதி மருந்துகள்', 'ஆயுர்வேத / மூலிகை மருந்துகள்', 'பிற'],
          hi: ['कोई पिछला उपचार नहीं लिया', 'एलोपैथिक दवाएं ली थीं', 'आयुर्वेदिक या जड़ी-बूटी उपचार', 'अन्य'],
        },
        fieldKey: 'previous_treatment',
      },
    ],

    prakriti: [
      {
        id: 'ayush_body_build',
        stage: 'prakriti',
        question: {
          en: 'Let us understand your body nature. How would you describe your general body build?',
          ta: 'உங்கள் இயற்கையான உடல் தன்மையைப் புரிந்து கொள்வோம். உங்கள் உடல் அமைப்பை எவ்வாறு விவரிப்பீர்கள்?',
          hi: 'आइए आपके स्वाभाविक शरीर की प्रकृति को समझें। आप अपनी शारीरिक बनावट को कैसे वर्णित करेंगे?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Slim', 'Medium', 'Broad / Strong', 'Not Sure'],
          ta: ['மெலிந்த தேகம் (Slim)', 'நடுத்தர உடல் (Medium)', 'திடமான தேகம் (Broad / Strong)', 'தெரியவில்லை (Not Sure)'],
          hi: ['पतला शरीर (Slim)', 'मध्यम शारीरिक बनावट (Medium)', 'मजबूत / चौड़ी बनावट (Broad / Strong)', 'निश्चित नहीं (Not Sure)'],
        },
        fieldKey: 'body_build',
      },
    ],

    vikriti: [
      {
        id: 'ayush_digestive_changes',
        stage: 'vikriti',
        question: {
          en: 'How is your digestion and appetite generally?',
          ta: 'பொதுவாக உங்கள் பசி மற்றும் செரிமானம் எவ்வாறு உள்ளது?',
          hi: 'सामान्य तौर पर आपका पाचन और भूख कैसी रहती है?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Good', 'Gas / Bloating', 'Acidity / Burning', 'Irregular / Low Appetite'],
          ta: ['நன்றாக உள்ளது', 'வாயு / வயிறு உப்பசம்', 'அமிலத்தன்மை / நெஞ்செரிச்சல்', 'சீரற்ற பசி / மந்தம்'],
          hi: ['अच्छा', 'गैस / पेट फूलना', 'एसिडिटी / जलन', 'अनियमित / कम भूख'],
        },
        fieldKey: 'digestive_changes',
      },
    ],

    ahara: [
      {
        id: 'ayush_diet_type',
        stage: 'ahara',
        question: {
          en: 'What type of diet do you primarily consume?',
          ta: 'நீங்கள் வழக்கமாக உட்கொள்ளும் உணவு முறை என்ன?',
          hi: 'आप मुख्य रूप से किस प्रकार का भोजन करते हैं?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Vegetarian (Home-cooked)', 'Non-Vegetarian', 'Mixed with outside food', 'Other'],
          ta: ['தூய சைவ உணவு (வீட்டுச் சமையல்)', 'அசைவ உணவு', 'கலப்பு / துரித உணவுகளுடன்', 'பிற'],
          hi: ['शुद्ध शाकाहारी (घर का भोजन)', 'मांसाहारी', 'मिश्रित / बाहर का खाना', 'अन्य'],
        },
        fieldKey: 'food_types',
      },
    ],

    vihara: [
      {
        id: 'ayush_physical_activity',
        stage: 'vihara',
        question: {
          en: 'How active are you in daily life?',
          ta: 'அன்றாட வாழ்வில் உங்கள் உடல் இயக்கம் எவ்வாறு உள்ளது?',
          hi: 'आप दैनिक जीवन में कितने सक्रिय रहते हैं?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Very Active', 'Moderately Active', 'Mostly Sedentary'],
          ta: ['மிகவும் சுறுசுறுப்பானது', 'மிதமான உடலுழைப்பு', 'அமர்ந்து வேலை செய்தல் (Sedentary)'],
          hi: ['बहुत सक्रिय (Very Active)', 'मध्यम सक्रिय (Moderately Active)', 'बैठे रहने वाला काम (Mostly Sedentary)'],
        },
        fieldKey: 'physical_activity',
      },
      {
        id: 'ayush_sleep_pattern',
        stage: 'vihara',
        question: {
          en: 'How is your nighttime sleep?',
          ta: 'உங்கள் இரவு நேர தூக்கம் எவ்வாறு உள்ளது?',
          hi: 'आपकी रात की नींद कैसी रहती है?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['Good / Refreshing', 'Light Sleep', 'Disturbed', 'Difficulty Sleeping'],
          ta: ['நல்ல புத்துணர்ச்சியான தூக்கம்', 'லேசான தூக்கம்', 'தடைபடும் தூக்கம்', 'தூங்குவதில் சிரமம்'],
          hi: ['अच्छी और गहरी नींद', 'हल्की नींद', 'टूटी-टूटी नींद', 'नींद आने में कठिनाई'],
        },
        fieldKey: 'sleep',
      },
    ],

    dashavidha_pariksha: [
      {
        id: 'ayush_final_check',
        stage: 'dashavidha_pariksha',
        question: {
          en: 'Is there anything else important you would like the Ayurvedic doctor to know?',
          ta: 'ஆயுர்வேத மருத்துவரிடம் தெரிவிக்க வேறு ஏதேனும் முக்கிய விவரங்கள் உள்ளதா?',
          hi: 'क्या कोई और महत्वपूर्ण बात है जो आप आयुर्वेदिक चिकित्सक को बताना चाहते हैं?',
        },
        questionType: 'multiple_choice',
        options: {
          en: ['No, Continue to Summary', 'Yes, I want to add something'],
          ta: ['இல்லை, சுருக்கத்திற்கு தொடரவும்', 'ஆம், கூடுதல் விவரம் சேர்க்க வேண்டும்'],
          hi: ['नहीं, सारांश पर आगे बढ़ें', 'हाँ, मैं कुछ जोड़ना चाहता हूँ'],
        },
        fieldKey: 'sattva',
      },
    ],

    completed: [],
  };

  /**
   * Stage order for AYUSH interview sequence
   */
  static readonly AYUSH_STAGE_ORDER: AyushStage[] = [
    'presenting_complaint',
    'prakriti',
    'vikriti',
    'ahara',
    'vihara',
    'dashavidha_pariksha',
    'completed',
  ];

  /**
   * Initial Greeting for AYUSH intake
   */
  static getInitialGreeting(lang: PreferredLanguage = 'en'): ClinicalQuestion {
    const q = this.AYUSH_QUESTIONS.presenting_complaint[0];
    return {
      id: q.id,
      stage: 'presenting_complaint',
      question: q.question[lang] || q.question.en,
      questionType: q.questionType,
      options: q.options ? (q.options[lang] || q.options.en) : undefined,
      fieldKey: q.fieldKey,
    };
  }

  /**
   * Adaptive Next Question generator for AYUSH workflow
   */
  static getNextQuestion(
    currentStage: AyushStage,
    questionIndex: number,
    lang: PreferredLanguage = 'en'
  ): ClinicalQuestion | null {
    const stageQuestions = this.AYUSH_QUESTIONS[currentStage] || [];

    if (questionIndex < stageQuestions.length) {
      const q = stageQuestions[questionIndex];
      return {
        id: q.id,
        stage: currentStage,
        question: q.question[lang] || q.question.en,
        questionType: q.questionType,
        options: q.options ? (q.options[lang] || q.options.en) : undefined,
        fieldKey: q.fieldKey,
      };
    }

    return null;
  }

  /**
   * Transition to next AYUSH stage
   */
  static getNextStage(currentStage: AyushStage): AyushStage {
    const currentIndex = this.AYUSH_STAGE_ORDER.indexOf(currentStage);
    if (currentIndex !== -1 && currentIndex < this.AYUSH_STAGE_ORDER.length - 1) {
      return this.AYUSH_STAGE_ORDER[currentIndex + 1];
    }
    return 'completed';
  }

  /**
   * Maps patient age to Vaya (Dashavidha 10th parameter)
   */
  static mapAgeToVaya(age: number): string {
    if (age <= 16) {
      return 'Balya Vaya (Childhood / Growth Stage - Under 16 yrs)';
    } else if (age <= 60) {
      return `Madhyama Vaya (Adult / Middle Life Stage - ${age} yrs)`;
    } else {
      return `Vardhakya / Vriddha Vaya (Elderly / Geriatric Stage - ${age} yrs)`;
    }
  }

  /**
   * Saves structured AYUSH assessment into database
   */
  static async saveAssessment(input: CreateAyushAssessmentInput): Promise<AyushAssessment> {
    return mockDb.saveAyushAssessment(input);
  }

  /**
   * Retrieves AYUSH assessment by intake session ID
   */
  static async getAssessment(sessionId: string): Promise<AyushAssessment | null> {
    return mockDb.getAyushAssessmentBySession(sessionId);
  }
}
