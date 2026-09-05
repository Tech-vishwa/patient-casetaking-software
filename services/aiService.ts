import { PreferredLanguage } from '@/types/patient';
import { ClinicalStage, ClinicalQuestion, StructuredClinicalHistory } from '@/types/clinical';
import { ConsultationMode } from '@/types/intakeSession';
import { AyushStage } from '@/types/ayush';
import { AyushService } from './ayushService';

export type ComplaintCategory =
  | 'cardiovascular'
  | 'respiratory'
  | 'gastrointestinal'
  | 'neurological'
  | 'infectious_fever'
  | 'musculoskeletal'
  | 'general';

interface QuestionTemplate {
  id: string;
  stage: ClinicalStage;
  question: Record<PreferredLanguage, string>;
  questionType: 'text' | 'multiple_choice' | 'scale' | 'yes_no_unsure';
  options?: Record<PreferredLanguage, string[]>;
  fieldKey: string;
  isOptional?: boolean;
}

// -------------------------------------------------------------
// Clinical Question Templates
// -------------------------------------------------------------
const HPI_TEMPLATES: Record<ComplaintCategory, QuestionTemplate[]> = {
  cardiovascular: [
    {
      id: 'cv_onset',
      stage: 'hpi',
      question: {
        en: 'When did this chest pain or discomfort begin?',
        ta: 'இந்த நெஞ்சு வலி அல்லது அசௌகரியம் எப்போது தொடங்கியது?',
        hi: 'यह सीने में दर्द या बेचैनी कब शुरू हुई?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Within the last 1 hour', 'Today (few hours ago)', '1-2 days ago', 'More than a week ago'],
        ta: ['கடந்த 1 மணி நேரத்திற்குள்', 'இன்று (சில மணி நேரங்களுக்கு முன்)', '1-2 நாட்களுக்கு முன்', 'ஒரு வாரத்திற்கு மேல்'],
        hi: ['पिछले 1 घंटे के भीतर', 'आज (कुछ घंटे पहले)', '1-2 दिन पहले', 'एक सप्ताह से अधिक पहले'],
      },
      fieldKey: 'onset',
    },
    {
      id: 'cv_severity',
      stage: 'hpi',
      question: {
        en: 'On a scale from 1 (mild) to 10 (most severe), how intense is the pain?',
        ta: '1 (குறைந்த வலி) முதல் 10 (தாங்க முடியாத வலி) வரை, வலியின் தீவிரம் என்ன?',
        hi: '1 (हल्का) से 10 (अत्यधिक गंभीर) के पैमाने पर, दर्द कितना तीव्र है?',
      },
      questionType: 'scale',
      fieldKey: 'severity',
    },
    {
      id: 'cv_radiation',
      stage: 'hpi',
      question: {
        en: 'Does the pain spread to your left arm, shoulder, jaw, or back?',
        ta: 'வலி உங்கள் இடது கை, தோள்பட்டை, தாடை அல்லது முதுகுக்கு பரவுகிறதா?',
        hi: 'क्या दर्द आपके बाएं हाथ, कंधे, जबड़े या पीठ की तरफ फैलता है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Yes, spreads to left arm/shoulder', 'Yes, spreads to jaw/neck', 'Yes, spreads to back', 'No, stays in center only'],
        ta: ['ஆம், இடது கை/தோளுக்கு பரவுகிறது', 'ஆம், தாடை/கழுத்துக்கு பரவுகிறது', 'ஆம், முதுகுக்கு பரவுகிறது', 'இல்லை, நெஞ்சில் மட்டுமே'],
        hi: ['हाँ, बाएं हाथ/कंधे तक फैलता है', 'हाँ, जबड़े/गर्दन तक फैलता है', 'हाँ, पीठ तक फैलता है', 'नहीं, केवल सीने में रहता है'],
      },
      fieldKey: 'radiation',
    },
    {
      id: 'cv_associated',
      stage: 'hpi',
      question: {
        en: 'Are you experiencing sweating, breathing difficulty, or dizziness with this pain?',
        ta: 'இந்த வலியுடன் அதிக வியர்வை, மூச்சுத் திணறல் அல்லது மயக்கம் உள்ளதா?',
        hi: 'क्या इस दर्द के साथ अत्यधिक पसीना, सांस लेने में कठिनाई या चक्कर आ रहे हैं?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Yes, sweating and breathlessness', 'Only breathing difficulty', 'Only dizziness', 'No associated symptoms'],
        ta: ['ஆம், வியர்வை மற்றும் மூச்சுத்திணறல்', 'மூச்சுத்திணறல் மட்டுமே', 'மயக்கம் மட்டுமே', 'வேறு அறிகுறிகள் இல்லை'],
        hi: ['हाँ, पसीना और सांस फूलना', 'केवल सांस लेने में तकलीफ', 'केवल चक्कर आना', 'कोई अन्य लक्षण नहीं'],
      },
      fieldKey: 'associated_symptoms',
    },
  ],

  infectious_fever: [
    {
      id: 'fever_duration',
      stage: 'hpi',
      question: {
        en: 'How many days have you had this fever?',
        ta: 'எத்தனை நாட்களாக இந்த காய்ச்சல் உள்ளது?',
        hi: 'आपको कितने दिनों से यह बुखार है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Since today', '2-3 days', '4-7 days', 'More than a week'],
        ta: ['இன்று முதல்', '2-3 நாட்கள்', '4-7 நாட்கள்', 'ஒரு வாரத்திற்கு மேல்'],
        hi: ['आज से', '2-3 दिन', '4-7 दिन', 'एक सप्ताह से अधिक'],
      },
      fieldKey: 'duration',
    },
    {
      id: 'fever_chills',
      stage: 'hpi',
      question: {
        en: 'Do you get shivering, chills, or sweating when the fever rises?',
        ta: 'காய்ச்சல் வரும்போது நடுக்கம், குளிர் அல்லது அதிக வியர்வை ஏற்படுகிறதா?',
        hi: 'क्या बुखार आने पर कंपकंपी, ठंड या बहुत पसीना आता है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Yes, with severe chills and shivering', 'Yes, only sweating', 'No chills or sweating', 'Continuous body warmth'],
        ta: ['ஆம், நடுக்கம் மற்றும் குளிர் உண்டு', 'வியர்வை மட்டுமே', 'நடுக்கம் இல்லை', 'தொடர்ச்சியான உடல் சூடு'],
        hi: ['हाँ, तेज कंपकंपी और ठंड के साथ', 'हाँ, केवल पसीना', 'कोई कंपकंपी नहीं', 'लगातार शरीर गर्म रहना'],
      },
      fieldKey: 'associated_symptoms',
    },
    {
      id: 'fever_associated',
      stage: 'hpi',
      question: {
        en: 'Do you also have throat pain, headache, cough, or body pain?',
        ta: 'தொண்டை வலி, தலைவலி, இருமல் அல்லது கடுமையான உடல் வலி உள்ளதா?',
        hi: 'क्या आपको गले में दर्द, सिरदर्द, खांसी या शरीर में दर्द भी है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Cough and throat pain', 'Severe headache & eye pain', 'Severe body & joint ache', 'None of these'],
        ta: ['இருமல் மற்றும் தொண்டை வலி', 'கடும் தலைவலி & கண் வலி', 'கடும் உடல் & மூட்டு வலி', 'இவை எதுவும் இல்லை'],
        hi: ['खांसी और गले में खराश', 'तेज सिरदर्द और आंखों में दर्द', 'शरीर और जोड़ों में तेज दर्द', 'इनमें से कोई नहीं'],
      },
      fieldKey: 'associated_symptoms',
    },
  ],

  respiratory: [
    {
      id: 'resp_duration',
      stage: 'hpi',
      question: {
        en: 'How long have you had this cough or breathing issue?',
        ta: 'எவ்வளவு காலமாக இந்த இருமல் அல்லது சுவாசப் பிரச்சனை உள்ளது?',
        hi: 'आपको यह खांसी या सांस की समस्या कितने समय से है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Less than 3 days', '1-2 weeks', '3-4 weeks', 'More than a month'],
        ta: ['3 நாட்களுக்குள்', '1-2 வாரங்கள்', '3-4 வாரங்கள்', 'ஒரு மாதத்திற்கு மேல்'],
        hi: ['3 दिन से कम', '1-2 सप्ताह', '3-4 सप्ताह', 'एक महीने से अधिक'],
      },
      fieldKey: 'duration',
    },
    {
      id: 'resp_type',
      stage: 'hpi',
      question: {
        en: 'Is the cough dry, or is there phlegm (mucus)?',
        ta: 'இருமல் வறட்டு இருமலா, அல்லது சளி வெளிவருகிறதா?',
        hi: 'क्या यह सूखी खांसी है या बलगम (कफ) निकल रहा है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Dry cough', 'Wet cough with clear/white phlegm', 'Thick yellow/green phlegm', 'Traces of blood seen'],
        ta: ['வறட்டு இருமல்', 'வெள்ளை சளியுடன் இருமல்', 'மஞ்சள்/பச்சை நிற கெட்டி சளி', 'ரத்தக் கசிவு தென்படுகிறது'],
        hi: ['सूखी खांसी', 'सफेद/साफ बलगम के साथ खांसी', 'गाढ़ा पीला/हरा बलगम', 'खून के अंश दिखाई दिए'],
      },
      fieldKey: 'character',
    },
    {
      id: 'resp_breathlessness',
      stage: 'hpi',
      question: {
        en: 'Do you feel short of breath while walking or lying down?',
        ta: 'நடக்கும் போதோ அல்லது படுக்கும் போதோ மூச்சுத்திணறல் ஏற்படுகிறதா?',
        hi: 'क्या चलने पर या लेटने पर आपकी सांस फूलती है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Yes, difficulty even while resting', 'Yes, only while walking/climbing', 'Yes, worse when lying flat', 'No breathing difficulty'],
        ta: ['ஆம், ஓய்வில் இருக்கும்போதும் மூச்சுத்திணறல்', 'நடக்கும்போது மட்டுமே', 'படுக்கும்போது அதிகமாகிறது', 'மூச்சுத்திணறல் இல்லை'],
        hi: ['हाँ, आराम करते समय भी सांस फूलती है', 'हाँ, केवल चलने/चढ़ने पर', 'हाँ, लेटने पर बढ़ जाती है', 'सांस में कोई तकलीफ नहीं'],
      },
      fieldKey: 'associated_symptoms',
    },
  ],

  gastrointestinal: [
    {
      id: 'gi_location',
      stage: 'hpi',
      question: {
        en: 'Where exactly is the stomach pain or discomfort felt?',
        ta: 'வயிற்றில் வலி அல்லது அசௌகரியம் சரியாக எந்த இடத்தில் உள்ளது?',
        hi: 'पेट में दर्द या बेचैनी वास्तव में किस स्थान पर महसूस हो रही है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Upper stomach (near chest)', 'Around the navel / center', 'Lower right side', 'Lower left side / all over'],
        ta: ['மேல் வயிறு (நெஞ்சுக்குக் கீழ்)', 'தொப்புள் சுற்றிலும் / நடுவில்', 'கீழ் வலது புறம்', 'கீழ் இடது புறம் / வயிறு முழுவதும்'],
        hi: ['ऊपरी पेट (सीने के नीचे)', 'नाभि के आसपास / बीच में', 'निचले दाहिने हिस्से में', 'निचले बाएं हिस्से / पूरे पेट में'],
      },
      fieldKey: 'location',
    },
    {
      id: 'gi_associated',
      stage: 'hpi',
      question: {
        en: 'Are you experiencing vomiting, loose stools (diarrhea), or severe acidity?',
        ta: 'வாந்தி, வயிற்றுப்போக்கு அல்லது கடுமையான நெஞ்செரிச்சல் உள்ளதா?',
        hi: 'क्या आपको उल्टी, दस्त या गंभीर एसिडिटी हो रही है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Vomiting and nausea', 'Loose motion / diarrhea', 'Severe burning acidity', 'No vomiting or diarrhea'],
        ta: ['வாந்தி மற்றும் குமட்டல்', 'வயிற்றுப்போக்கு', 'கடும் நெஞ்செரிச்சல் / அசிடிட்டி', 'வாந்தி அல்லது வயிற்றுப்போக்கு இல்லை'],
        hi: ['उल्टी और जी मिचलाना', 'दस्त / लूज मोशन', 'सीने में जलन / एसिडिटी', 'उल्टी या दस्त नहीं है'],
      },
      fieldKey: 'associated_symptoms',
    },
  ],

  neurological: [
    {
      id: 'neuro_onset',
      stage: 'hpi',
      question: {
        en: 'Did this headache or dizziness start suddenly, or gradually over days?',
        ta: 'இந்த தலைவலி அல்லது மயக்கம் திடீரென வந்ததா, அல்லது படிப்படியாக அதிகரித்ததா?',
        hi: 'क्या यह सिरदर्द या चक्कर अचानक शुरू हुआ, या धीरे-धीरे कई दिनों में बढ़ा?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Sudden thunderclap severe headache', 'Gradually over the day', 'Ongoing for several days/weeks', 'Comes and goes in episodes'],
        ta: ['திடீரென மின்னல் போன்ற கடும் தலைவலி', 'படிப்படியாக அதிகரித்தது', 'பல நாட்களாக உள்ளது', 'வந்து வந்து போகிறது'],
        hi: ['अचानक बहुत तेज सिरदर्द', 'धीरे-धीरे पूरे दिन में बढ़ा', 'कई दिनों/सप्ताहों से लगातार है', 'रुक-रुक कर आता है'],
      },
      fieldKey: 'onset',
    },
    {
      id: 'neuro_vision',
      stage: 'hpi',
      question: {
        en: 'Do you have blurry vision, sensitivity to light, or nausea?',
        ta: 'மங்கலான பார்வை, வெளிச்சத்தை பார்க்க முடியாத நிலை அல்லது குமட்டல் உள்ளதா?',
        hi: 'क्या आपको धुंधला दिखाई देना, तेज रोशनी से परेशानी या जी मिचलाना है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Yes, blurry vision and light sensitivity', 'Yes, nausea and vomiting', 'Only headache', 'No visual or nausea symptoms'],
        ta: ['ஆம், மங்கலான பார்வை & வெளிச்சக் கூச்சம்', 'ஆம், குமட்டல் & வாந்தி', 'தலைவலி மட்டுமே', 'வேறு அறிகுறிகள் இல்லை'],
        hi: ['हाँ, धुंधलापन और रोशनी से तकलीफ', 'हाँ, जी मिचलाना और उल्टी', 'केवल सिरदर्द', 'कोई अन्य लक्षण नहीं'],
      },
      fieldKey: 'associated_symptoms',
    },
  ],

  musculoskeletal: [
    {
      id: 'msk_location',
      stage: 'hpi',
      question: {
        en: 'Which joint or muscle area is affected?',
        ta: 'எந்த மூட்டு அல்லது தசைப் பகுதியில் வலி உள்ளது?',
        hi: 'किस जोड़ या मांसपेशी में दर्द है?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['Lower back / spine', 'Knee joints (one or both)', 'Shoulder / neck', 'Multiple joints / generalized'],
        ta: ['இடுப்பு / முதுகுத்தண்டு', 'முழங்கால் மூட்டுகள்', 'தோள்பட்டை / கழுத்து', 'பல மூட்டுகள் / உடல் முழுவதும்'],
        hi: ['कमर / रीढ़ की हड्डी', 'घुटने के जोड़', 'कंधा / गर्दन', 'कई जोड़ / पूरे शरीर में'],
      },
      fieldKey: 'location',
    },
  ],

  general: [
    {
      id: 'gen_duration',
      stage: 'hpi',
      question: {
        en: 'How long have you been experiencing this issue?',
        ta: 'எவ்வளவு காலமாக இந்த உடல்நலப் பிரச்சனை உள்ளது?',
        hi: 'आप कितने समय से इस समस्या का सामना कर रहे हैं?',
      },
      questionType: 'multiple_choice',
      options: {
        en: ['1-3 days', 'About 1-2 weeks', '1-3 months', 'Long standing (>6 months)'],
        ta: ['1-3 நாட்கள்', 'சுமார் 1-2 வாரங்கள்', '1-3 மாதங்கள்', 'நீண்ட காலமாக (>6 மாதங்கள்)'],
        hi: ['1-3 दिन', 'लगभग 1-2 सप्ताह', '1-3 महीने', 'लंबे समय से (>6 महीने)'],
      },
      fieldKey: 'duration',
    },
  ],
};

// -------------------------------------------------------------
// System-wide Medical, Surgical, Meds, Allergy, Family questions
// -------------------------------------------------------------
const SYSTEM_QUESTIONS: QuestionTemplate[] = [
  {
    id: 'pmh_conditions',
    stage: 'past_medical_history',
    question: {
      en: 'Do you have any existing diagnosed health conditions?',
      ta: 'உங்களுக்கு ஏற்கனவே கண்டறியப்பட்ட நீண்டகால நோய்கள் உள்ளதா?',
      hi: 'क्या आपको पहले से कोई पुरानी बीमारी या स्वास्थ्य समस्या है?',
    },
    questionType: 'multiple_choice',
    options: {
      en: [
        'Diabetes (High Blood Sugar)',
        'Hypertension (High Blood Pressure)',
        'Heart Disease / Stent',
        'Asthma / Breathing issue',
        'Thyroid disorder',
        'No past health conditions',
      ],
      ta: [
        'சர்க்கரை நோய் (நீரிழிவு)',
        'உயர் இரத்த அழுத்தம் (BP)',
        'இதய நோய் / ஸ்டென்ட்',
        'ஆஸ்துமா / சுவாசக் கோளாறு',
        'தைராய்டு பிரச்சனை',
        'எந்த முந்தைய நோயும் இல்லை',
      ],
      hi: [
        'मधुमेह (डायबिटीज / शुगर)',
        'उच्च रक्तचाप (हाई बीपी)',
        'हृदय रोग / स्टेंट',
        'अस्थमा / दमा',
        'थायराइड की समस्या',
        'पहले से कोई बीमारी नहीं है',
      ],
    },
    fieldKey: 'conditions',
  },
  {
    id: 'surgeries_check',
    stage: 'surgical_history',
    question: {
      en: 'Have you had any major surgeries or hospitalizations in the past?',
      ta: 'கடந்த காலத்தில் ஏதேனும் அறுவை சிகிச்சை அல்லது மருத்துவமனையில் அனுமதிக்கப்பட்டுள்ளீர்களா?',
      hi: 'क्या पहले आपकी कोई बड़ी सर्जरी या अस्पताल में भर्ती हुए हैं?',
    },
    questionType: 'multiple_choice',
    options: {
      en: ['Yes, surgery within last 2 years', 'Yes, surgery >2 years ago', 'No past surgeries', 'Not sure'],
      ta: ['ஆம், கடந்த 2 ஆண்டுகளுக்குள் அறுவை சிகிச்சை', 'ஆம், 2 ஆண்டுகளுக்கு முன் அறுவை சிகிச்சை', 'அறுவை சிகிச்சை எதுவும் இல்லை', 'நிச்சயமாக தெரியவில்லை'],
      hi: ['हाँ, पिछले 2 वर्षों में सर्जरी', 'हाँ, 2 साल से पहले सर्जरी', 'कोई पिछली सर्जरी नहीं', 'निश्चित नहीं'],
    },
    fieldKey: 'surgeries',
  },
  {
    id: 'meds_current',
    stage: 'medications',
    question: {
      en: 'Are you currently taking any daily prescribed medicines?',
      ta: 'நீங்கள் தற்போது தினமும் எடுத்துக்கொள்ளும் மாத்திரைகள் ஏதேனும் உள்ளதா?',
      hi: 'क्या आप वर्तमान में कोई नियमित दवाएं ले रहे हैं?',
    },
    questionType: 'multiple_choice',
    options: {
      en: [
        'Taking BP medicines',
        'Taking Diabetes medicines',
        'Taking Heart / Blood thinner medicines',
        'Taking Thyroid medicines',
        'No regular medicines',
      ],
      ta: [
        'BP மாத்திரைகள் எடுத்துக்கொள்கிறேன்',
        'சர்க்கரை மாத்திரைகள் / இன்சுலின்',
        'இதய / ரத்தத்தை மெலிதாக்கும் மருந்துகள்',
        'தைராய்டு மாத்திரைகள்',
        'வழக்கமான மருந்துகள் எதுவும் இல்லை',
      ],
      hi: [
        'बीपी की दवाएं ले रहे हैं',
        'डायबिटीज की दवाएं / इंसुलिन',
        'हृदय / खून पतला करने की दवाएं',
        'थायराइड की दवाएं',
        'कोई नियमित दवाएं नहीं हैं',
      ],
    },
    fieldKey: 'medications',
  },
  {
    id: 'allergies_check',
    stage: 'allergies',
    question: {
      en: 'Do you have any known allergies to medicines, injections, or foods?',
      ta: 'மருந்துகள், ஊசிகள் அல்லது உணவுப் பொருட்களுக்கு ஏதேனும் ஒவ்வாமை (Allergy) உள்ளதா?',
      hi: 'क्या आपको किसी दवा, इंजेक्शन या खाद्य पदार्थ से कोई एलर्जी है?',
    },
    questionType: 'multiple_choice',
    options: {
      en: [
        'Penicillin / Antibiotic allergy',
        'Painkiller (NSAID) allergy',
        'Food allergy (Peanuts, Seafood, etc.)',
        'No known allergies (Safe)',
      ],
      ta: [
        'பென்சிலின் / ஆன்டிபயாடிக் ஒவ்வாமை',
        'வலி நிவாரணி மாத்திரை ஒவ்வாமை',
        'உணவு ஒவ்வாமை',
        'எந்த ஒவ்வாமையும் இல்லை',
      ],
      hi: [
        'पेनिसिलिन / एंटीबायोटिक एलर्जी',
        'दर्द निवारक दवा (पेनकिलर) एलर्जी',
        'खाद्य एलर्जी',
        'कोई ज्ञात एलर्जी नहीं है',
      ],
    },
    fieldKey: 'allergies',
  },
  {
    id: 'family_history_check',
    stage: 'family_history',
    question: {
      en: 'Is there a family history of early heart disease, diabetes, or cancer in your parents or siblings?',
      ta: 'பெற்றோர் அல்லது உடன் பிறந்தவர்களுக்கு ஆரம்பகால இதய நோய், சர்க்கரை நோய் அல்லது புற்றுநோய் வரலாறு உள்ளதா?',
      hi: 'क्या आपके परिवार (माता-पिता/भाई-बहन) में कम उम्र में हृदय रोग, डायबिटीज या कैंसर का इतिहास है?',
    },
    questionType: 'multiple_choice',
    options: {
      en: ['Family history of Heart Disease', 'Family history of Diabetes', 'Family history of Hypertension', 'No major family medical history'],
      ta: ['குடும்பத்தில் இதய நோய் வரலாறு', 'குடும்பத்தில் சர்க்கரை நோய் வரலாறு', 'குடும்பத்தில் உயர் ரத்த அழுத்தம்', 'குறிப்பிட்ட குடும்ப வரலாறு இல்லை'],
      hi: ['परिवार में हृदय रोग का इतिहास', 'परिवार में डायबिटीज का इतिहास', 'परिवार में हाई बीपी का इतिहास', 'कोई विशेष पारिवारिक इतिहास नहीं'],
    },
    fieldKey: 'family_history',
  },
  {
    id: 'personal_lifestyle',
    stage: 'personal_history',
    question: {
      en: 'Lifestyle & Habits (Optional & Confidential):',
      ta: 'வாழ்க்கை முறை மற்றும் பழக்கவழக்கங்கள் (விருப்பமானது):',
      hi: 'जीवनशैली और आदतें (वैकल्पिक एवं गोपनीय):',
    },
    questionType: 'multiple_choice',
    options: {
      en: ['Non-smoker, Non-alcoholic (Vegetarian)', 'Non-smoker, Non-alcoholic (Non-Veg)', 'Occasional smoking / alcohol', 'Regular smoking or tobacco use'],
      ta: ['புகை/மது பழக்கம் இல்லை (சைவம்)', 'புகை/மது பழக்கம் இல்லை (அசைவம்)', 'எப்போதாவது புகை / மது', 'வழக்கமான புகையிலை பழக்கம்'],
      hi: ['धूम्रपान/शराब नहीं (शाकाहारी)', 'धूम्रपान/शराब नहीं (मांसाहारी)', 'कभी-कभार धूम्रपान/शराब', 'नियमित तंबाकू/धूम्रपान'],
    },
    fieldKey: 'personal_history',
  },
];

export class AIService {
  /**
   * Classify Chief Complaint into broad clinical categories
   */
  static classifyComplaint(text: string): ComplaintCategory {
    const lower = text.toLowerCase();

    if (
      lower.includes('chest') ||
      lower.includes('heart') ||
      lower.includes('palpitation') ||
      lower.includes('நெஞ்சு') ||
      lower.includes('சீனை') ||
      lower.includes('छाती') ||
      lower.includes('दिल')
    ) {
      return 'cardiovascular';
    }

    if (
      lower.includes('fever') ||
      lower.includes('temperature') ||
      lower.includes('chills') ||
      lower.includes('shivering') ||
      lower.includes('காய்ச்சல்') ||
      lower.includes('சூடு') ||
      lower.includes('बुखार') ||
      lower.includes('तापमान')
    ) {
      return 'infectious_fever';
    }

    if (
      lower.includes('cough') ||
      lower.includes('breath') ||
      lower.includes('phlegm') ||
      lower.includes('wheez') ||
      lower.includes('இருமல்') ||
      lower.includes('சளி') ||
      lower.includes('மூச்சு') ||
      lower.includes('खांसी') ||
      lower.includes('सांस') ||
      lower.includes('बलगम')
    ) {
      return 'respiratory';
    }

    if (
      lower.includes('stomach') ||
      lower.includes('abdomen') ||
      lower.includes('vomit') ||
      lower.includes('diarrhea') ||
      lower.includes('motions') ||
      lower.includes('acidity') ||
      lower.includes('வயிறு') ||
      lower.includes('வாந்தி') ||
      lower.includes('வயிற்றுப்போக்கு') ||
      lower.includes('पेट') ||
      lower.includes('उल्टी') ||
      lower.includes('दस्त')
    ) {
      return 'gastrointestinal';
    }

    if (
      lower.includes('headache') ||
      lower.includes('migraine') ||
      lower.includes('dizzy') ||
      lower.includes('faint') ||
      lower.includes('seizure') ||
      lower.includes('vision') ||
      lower.includes('தலைவலி') ||
      lower.includes('மயக்கம்') ||
      lower.includes('வலிப்பு') ||
      lower.includes('सिरदर्द') ||
      lower.includes('माइग्रेन') ||
      lower.includes('चक्कर') ||
      lower.includes('दौरा')
    ) {
      return 'neurological';
    }

    if (
      lower.includes('knee') ||
      lower.includes('back pain') ||
      lower.includes('joint') ||
      lower.includes('leg pain') ||
      lower.includes('மூட்டு') ||
      lower.includes('இடுப்பு') ||
      lower.includes('कमर') ||
      lower.includes('जोड़ों')
    ) {
      return 'musculoskeletal';
    }

    return 'general';
  }

  /**
   * Generates initial greeting in chosen language and consultation mode
   */
  static getInitialGreeting(
    lang: PreferredLanguage = 'en',
    consultationMode: ConsultationMode = 'MODERN_MEDICINE'
  ): ClinicalQuestion {
    if (consultationMode === 'AYUSH') {
      return AyushService.getInitialGreeting(lang);
    }

    const questions: Record<PreferredLanguage, string> = {
      en: 'Hello. I am Medi, your clinical assistant. Please tell me or select what main health problem brings you to the hospital today?',
      ta: 'வணக்கம். நான் மெடி (Medi), உங்கள் மருத்துவ உதவியாளர். இன்று மருத்துவமனைக்கு வரக் காரணமான உங்கள் முக்கிய உடல்நலப் பிரச்சனை என்ன?',
      hi: 'नमस्ते। मैं मेडी (Medi) हूँ, आपका क्लिनिकल सहायक। कृपया मुझे बताएं कि आज आपको अस्पताल किस मुख्य समस्या के कारण आना पड़ा?',
    };

    const options: Record<PreferredLanguage, string[]> = {
      en: ['Chest Pain / Discomfort', 'Fever & Shivering', 'Cough & Breathing Issue', 'Severe Stomach Pain', 'Severe Headache', 'Body Ache / Joint Pain'],
      ta: ['நெஞ்சு வலி / அசௌகரியம்', 'காய்ச்சல் & நடுக்கம்', 'இருமல் & மூச்சுத்திணறல்', 'வயிற்று வலி', 'தலைவலி & மயக்கம்', 'உடல் வலி / மூட்டு வலி'],
      hi: ['सीने में दर्द / बेचैनी', 'बुखार और कंपकंपी', 'खांसी और सांस की तकलीफ', 'पेट में तेज दर्द', 'सिरदर्द और चक्कर', 'शरीर दर्द / जोड़ों का दर्द'],
    };

    return {
      id: 'chief_complaint_initial',
      stage: 'chief_complaint',
      question: questions[lang] || questions.en,
      questionType: 'multiple_choice',
      options: options[lang] || options.en,
      fieldKey: 'chief_complaint',
    };
  }

  /**
   * Deterministic State Machine for generating the sequence of clinical questions
   */
  static getNextQuestion(
    currentStage: ClinicalStage,
    questionIndex: number,
    complaintCategory: ComplaintCategory,
    lang: PreferredLanguage = 'en',
    consultationMode: ConsultationMode = 'MODERN_MEDICINE',
    existingAnswers?: Record<string, string>
  ): ClinicalQuestion | null {
    if (consultationMode === 'AYUSH') {
      return AyushService.getNextQuestion(currentStage as AyushStage, questionIndex, lang);
    }

    if (currentStage === 'hpi') {
      const hpiQuestions = HPI_TEMPLATES[complaintCategory] || HPI_TEMPLATES.general;
      // Cap follow-up HPI questions to maximum 4 (3 to 5 questions including chief complaint)
      const cappedLength = Math.min(hpiQuestions.length, 4);
      let targetIdx = questionIndex;

      // Deduplication: if field was already answered in existingAnswers, skip to next question
      while (targetIdx < cappedLength) {
        const candidate = hpiQuestions[targetIdx];
        if (existingAnswers && candidate.fieldKey && existingAnswers[candidate.fieldKey]) {
          targetIdx++;
        } else {
          break;
        }
      }

      if (targetIdx < cappedLength) {
        const q = hpiQuestions[targetIdx];
        return {
          id: q.id,
          stage: 'hpi',
          question: q.question[lang] || q.question.en,
          questionType: q.questionType,
          options: q.options ? (q.options[lang] || q.options.en) : undefined,
          fieldKey: q.fieldKey,
        };
      }
      return null;
    }

    // System-wide stages: PMH, Surgical, Meds, Allergies, Family, Personal
    const stageMap: Record<string, number> = {
      past_medical_history: 0,
      surgical_history: 1,
      medications: 2,
      allergies: 3,
      family_history: 4,
      personal_history: 5,
    };

    const sysIdx = stageMap[currentStage];
    if (sysIdx !== undefined && sysIdx < SYSTEM_QUESTIONS.length) {
      const q = SYSTEM_QUESTIONS[sysIdx];
      return {
        id: q.id,
        stage: q.stage,
        question: q.question[lang] || q.question.en,
        questionType: q.questionType,
        options: q.options ? (q.options[lang] || q.options.en) : undefined,
        fieldKey: q.fieldKey,
      };
    }

    return null;
  }

  /**
   * Deterministic categorization of patient chief complaint into clinical sub-specialty
   */
  static detectComplaintCategory(text: string): ComplaintCategory {
    if (!text) return 'general';
    const lower = text.toLowerCase();
    if (
      lower.includes('chest') ||
      lower.includes('heart') ||
      lower.includes('நெஞ்சு') ||
      lower.includes('மார்பு') ||
      lower.includes('सीना') ||
      lower.includes('छाती') ||
      lower.includes('दिल')
    ) {
      return 'cardiovascular';
    }
    if (
      lower.includes('breath') ||
      lower.includes('cough') ||
      lower.includes('wheez') ||
      lower.includes('மூச்சு') ||
      lower.includes('இருமல்') ||
      lower.includes('सांस') ||
      lower.includes('खांसी')
    ) {
      return 'respiratory';
    }
    if (
      lower.includes('stomach') ||
      lower.includes('belly') ||
      lower.includes('vomit') ||
      lower.includes('nausea') ||
      lower.includes('diarrhea') ||
      lower.includes('வயிறு') ||
      lower.includes('வாந்தி') ||
      lower.includes('பேதி') ||
      lower.includes('पेट') ||
      lower.includes('उल्टी') ||
      lower.includes('दस्त')
    ) {
      return 'gastrointestinal';
    }
    if (
      lower.includes('headache') ||
      lower.includes('dizz') ||
      lower.includes('faint') ||
      lower.includes('seizure') ||
      lower.includes('தலைவலி') ||
      lower.includes('மயக்கம்') ||
      lower.includes('வலிப்பு') ||
      lower.includes('सिरदर्द') ||
      lower.includes('चक्कर') ||
      lower.includes('दौरा')
    ) {
      return 'neurological';
    }
    if (
      lower.includes('fever') ||
      lower.includes('chills') ||
      lower.includes('shiver') ||
      lower.includes('காய்ச்சல்') ||
      lower.includes('நடுக்கம்') ||
      lower.includes('बुखार') ||
      lower.includes('ठंड')
    ) {
      return 'infectious_fever';
    }
    if (
      lower.includes('joint') ||
      lower.includes('back') ||
      lower.includes('knee') ||
      lower.includes('shoulder') ||
      lower.includes('bone') ||
      lower.includes('முதுகு') ||
      lower.includes('மூட்டு') ||
      lower.includes('पीठ') ||
      lower.includes('घुटना') ||
      lower.includes('हड्डी')
    ) {
      return 'musculoskeletal';
    }
    return 'general';
  }
}
