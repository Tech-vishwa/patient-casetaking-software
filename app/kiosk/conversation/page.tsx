'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { ClinicalStage, ClinicalQuestion, ConversationMessage, RedFlagAlert } from '@/types/clinical';
import { AyushStage } from '@/types/ayush';
import { AIService, ComplaintCategory } from '@/services/aiService';
import { AyushService } from '@/services/ayushService';
import { RedFlagService } from '@/services/redFlagService';
import { ClinicalService } from '@/services/clinicalService';
import { AiAvatar } from '@/components/kiosk/AiAvatar';
import { InputMode } from '@/components/kiosk/InputMode';
import { ConversationProgress } from '@/components/kiosk/ConversationProgress';
import { RedFlagModal } from '@/components/kiosk/RedFlagModal';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { Bot, CheckCircle2, AlertTriangle, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { mockDb } from '@/lib/supabase/mockDb';

export default function ConversationalHistoryPage() {
  const router = useRouter();
  const { language, t, speakText, isVoiceGuidanceEnabled, toggleVoiceGuidance } = useLanguage();
  const { patient, session, consent, consultationMode, isLoading: sessionLoading, updateWorkflowState } = usePatientSession();

  const isAyush = consultationMode === 'AYUSH';

  // Current stage & question tracking
  const [stage, setStage] = useState<ClinicalStage>(isAyush ? 'presenting_complaint' : 'chief_complaint');
  const [complaintCategory, setComplaintCategory] = useState<ComplaintCategory>('general');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<ClinicalQuestion>(
    AIService.getInitialGreeting(language, consultationMode)
  );

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeRedFlag, setActiveRedFlag] = useState<RedFlagAlert | null>(null);
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState<boolean>(false);
  const [isFinishingInterview, setIsFinishingInterview] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Modern Medicine Collected Data
  const [collectedData, setCollectedData] = useState<{
    chief_complaint: string;
    hpi: Record<string, string>;
    past_medical_history: Array<{ condition: string; status: 'yes' | 'no' | 'not_sure' }>;
    surgical_history: Array<{ surgery: string }>;
    medications: Array<{ name: string }>;
    allergies: Array<{ allergen: string; type: 'drug' | 'food' | 'environmental' | 'other' }>;
    family_history: Array<{ relation: string; condition: string }>;
    personal_history: Record<string, string>;
  }>({
    chief_complaint: '',
    hpi: {},
    past_medical_history: [],
    surgical_history: [],
    medications: [],
    allergies: [],
    family_history: [],
    personal_history: {},
  });

  // AYUSH Collected Data
  const [ayushData, setAyushData] = useState<{
    presenting_complaint: string;
    duration: string;
    previous_treatment: string;
    current_symptoms: string[];
    prakriti: Record<string, string>;
    vikriti: Record<string, string>;
    ahara: Record<string, string>;
    vihara: Record<string, string>;
    dashavidha: Record<string, string>;
  }>({
    presenting_complaint: '',
    duration: '',
    previous_treatment: '',
    current_symptoms: [],
    prakriti: {},
    vikriti: {},
    ahara: {},
    vihara: {},
    dashavidha: {},
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Guard: Redirect if no active patient or consent
  useEffect(() => {
    if (!sessionLoading) {
      if (!patient) {
        router.replace('/kiosk/identification');
      } else if (!consent) {
        router.replace('/kiosk/consent');
      }
    }
  }, [sessionLoading, patient, consent, router]);

  // Initialize initial greeting or restore existing messages
  useEffect(() => {
    if (session && patient) {
      mockDb.getConversationMessages(session.id).then((storedMsgs) => {
        if (storedMsgs && storedMsgs.length > 0) {
          setMessages(storedMsgs);
          // Restore drafts
          if (isAyush) {
            AyushService.getAssessment(session.id).then((savedAssessment) => {
              if (savedAssessment) {
                setAyushData({
                  presenting_complaint: savedAssessment.presenting_complaint || '',
                  duration: savedAssessment.duration || '',
                  previous_treatment: savedAssessment.previous_treatment || '',
                  current_symptoms: savedAssessment.current_symptoms || [],
                  prakriti: (savedAssessment.prakriti as any) || {},
                  vikriti: (savedAssessment.vikriti as any) || {},
                  ahara: (savedAssessment.ahara_assessment as any) || {},
                  vihara: (savedAssessment.vihara_assessment as any) || {},
                  dashavidha: {
                    sara: savedAssessment.sara || '',
                    samhanana: savedAssessment.samhanana || '',
                    vyayama_shakti: savedAssessment.vyayama_shakti || '',
                    sattva: savedAssessment.sattva || '',
                  },
                });
              }
            });
          } else {
            ClinicalService.getClinicalHistory(session.id).then((hist) => {
              if (hist) {
                setCollectedData({
                  chief_complaint: hist.chief_complaint || '',
                  hpi: (hist.hpi as any) || {},
                  past_medical_history: hist.past_medical_history || [],
                  surgical_history: hist.surgical_history || [],
                  medications: hist.medications || [],
                  allergies: hist.allergies || [],
                  family_history: hist.family_history || [],
                  personal_history: (hist.personal_history as any) || {},
                });
              }
            });
          }
        } else if (messages.length === 0) {
          const initialGreeting = AIService.getInitialGreeting(language, consultationMode);
          setCurrentQuestion(initialGreeting);
          const initialMsg: ConversationMessage = {
            id: 'msg-init',
            sender: 'ai',
            text: initialGreeting.question,
            timestamp: new Date().toISOString(),
            stage: isAyush ? 'presenting_complaint' : 'chief_complaint',
          };
          setMessages([initialMsg]);
          speakText(initialGreeting.question);
        }
      });
    }
  }, [session?.id, patient?.id, consultationMode]);

  // Re-translate current question when language changes in-place without resetting answers
  useEffect(() => {
    if (isAyush) {
      const q = AIService.getNextQuestion(stage, questionIndex, 'general', language, 'AYUSH') ||
        AIService.getInitialGreeting(language, 'AYUSH');
      if (q) setCurrentQuestion(q);
    } else {
      if (stage === 'chief_complaint' && messages.length <= 1) {
        const updatedGreeting = AIService.getInitialGreeting(language, 'MODERN_MEDICINE');
        setCurrentQuestion(updatedGreeting);
      } else {
        const q = AIService.getNextQuestion(stage, questionIndex, complaintCategory, language, 'MODERN_MEDICINE');
        if (q) setCurrentQuestion(q);
      }
    }
  }, [language]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentQuestion, isProcessingAnswer]);

  // -----------------------------------------------------------------
  // Handle Patient Answer Submission (Voice / Text / Touch)
  // -----------------------------------------------------------------
  const handleAnswerSubmit = async (answerText: string, inputMode: 'voice' | 'text' | 'touch') => {
    if (!session || !patient || !answerText.trim() || isProcessingAnswer) return;

    setIsProcessingAnswer(true);
    setAvatarState('thinking');

    // 1. Add patient message to UI
    const patientMsg: ConversationMessage = {
      id: 'msg-pat-' + Date.now(),
      sender: 'patient',
      text: answerText,
      timestamp: new Date().toISOString(),
      stage,
      inputMode,
    };

    const updatedMessages = [...messages, patientMsg];
    setMessages(updatedMessages);

    // 2. Deterministic Red-Flag Safety Rule Engine (Applies to BOTH modes)
    const redFlagResult = RedFlagService.analyzeInput(answerText);
    if (redFlagResult.isTriggered) {
      const alert = await RedFlagService.recordAlert(
        session.id,
        patient.id,
        redFlagResult.category || 'CHEST_EMERGENCY',
        redFlagResult.severity || 'critical',
        redFlagResult.matchedTerms || []
      );
      setActiveRedFlag(alert);
    }

    // Persist conversation so far
    await mockDb.saveConversationMessages(session.id, updatedMessages);

    // -------------------------------------------------------------
    // AYUSH Flow
    // -------------------------------------------------------------
    if (isAyush) {
      const currentKey = currentQuestion.fieldKey || 'answer';
      const updatedAyush = { ...ayushData };

      if (stage === 'presenting_complaint') {
        if (currentKey === 'presenting_complaint') {
          updatedAyush.presenting_complaint = answerText;
          updatedAyush.current_symptoms = [answerText];
        } else if (currentKey === 'duration') {
          updatedAyush.duration = answerText;
        } else if (currentKey === 'previous_treatment') {
          updatedAyush.previous_treatment = answerText;
        }
      } else if (stage === 'prakriti') {
        updatedAyush.prakriti = { ...updatedAyush.prakriti, [currentKey]: answerText };
      } else if (stage === 'vikriti') {
        updatedAyush.vikriti = { ...updatedAyush.vikriti, [currentKey]: answerText };
      } else if (stage === 'ahara') {
        updatedAyush.ahara = { ...updatedAyush.ahara, [currentKey]: answerText };
      } else if (stage === 'vihara') {
        updatedAyush.vihara = { ...updatedAyush.vihara, [currentKey]: answerText };
      } else if (stage === 'dashavidha_pariksha') {
        updatedAyush.dashavidha = { ...updatedAyush.dashavidha, [currentKey]: answerText };
      }

      setAyushData(updatedAyush);

      // Check if there is a next question in this AYUSH stage
      const nextQIndex = questionIndex + 1;
      const nextQInStage = AIService.getNextQuestion(stage, nextQIndex, 'general', language, 'AYUSH');

      let nextStage: AyushStage = stage as AyushStage;
      let nextIndex = nextQIndex;

      if (!nextQInStage) {
        // Advance to next AYUSH stage
        nextStage = AyushService.getNextStage(stage as AyushStage);
        nextIndex = 0;
      }

      setStage(nextStage);
      setQuestionIndex(nextIndex);

      // If finished all AYUSH stages
      if (nextStage === 'completed') {
        setIsFinishingInterview(true);

        // Save structured assessment to database
        await AyushService.saveAssessment({
          patient_id: patient.id,
          intake_session_id: session.id,
          presenting_complaint: updatedAyush.presenting_complaint || 'General Ayurvedic Consultation',
          duration: updatedAyush.duration,
          previous_treatment: updatedAyush.previous_treatment,
          current_symptoms: updatedAyush.current_symptoms,
          prakriti: updatedAyush.prakriti,
          vikriti: updatedAyush.vikriti,
          ahara_assessment: updatedAyush.ahara,
          vihara_assessment: updatedAyush.vihara,
          sara: updatedAyush.dashavidha.sara,
          samhanana: updatedAyush.dashavidha.samhanana,
          vyayama_shakti: updatedAyush.dashavidha.vyayama_shakti,
          sattva: updatedAyush.dashavidha.sattva,
          vaya: AyushService.mapAgeToVaya(patient.age),
        });

        await updateWorkflowState('HISTORY_COMPLETED', 4, updatedAyush);

        setTimeout(() => {
          router.push('/kiosk/documents');
        }, 900);
        return;
      }

      // Generate next AI question
      const nextQ = AIService.getNextQuestion(nextStage, nextIndex, 'general', language, 'AYUSH');
      if (nextQ) {
        setCurrentQuestion(nextQ);
        const aiMsg: ConversationMessage = {
          id: 'msg-ai-' + Date.now(),
          sender: 'ai',
          text: nextQ.question,
          timestamp: new Date().toISOString(),
          stage: nextStage,
        };
        setMessages([...updatedMessages, aiMsg]);
        setAvatarState('speaking');
        speakText(nextQ.question);
      }

      setIsProcessingAnswer(false);
      return;
    }

    // -------------------------------------------------------------
    // Modern Medicine Flow (Allopathic)
    // -------------------------------------------------------------
    let nextStage: ClinicalStage = stage;
    let nextIndex = questionIndex;
    let nextCategory = complaintCategory;

    const updatedData = { ...collectedData };

    if (stage === 'chief_complaint') {
      updatedData.chief_complaint = answerText;
      const detectedCategory = AIService.detectComplaintCategory(answerText);
      setComplaintCategory(detectedCategory);
      nextCategory = detectedCategory;
      nextStage = 'hpi';
      nextIndex = 0;
    } else if (stage === 'hpi') {
      const field = currentQuestion.fieldKey || `hpi_${questionIndex}`;
      updatedData.hpi = { ...updatedData.hpi, [field]: answerText };

      // Limit HPI to essential questions (capped at 4 follow-ups max; 3-5 total questions including chief complaint)
      const nextHpiQuestion =
        questionIndex + 1 < 4
          ? AIService.getNextQuestion('hpi', questionIndex + 1, nextCategory, language, 'MODERN_MEDICINE', updatedData.hpi)
          : null;

      if (nextHpiQuestion) {
        nextIndex = questionIndex + 1;
      } else {
        // Essential HPI questions captured - smoothly advance to past medical history
        nextStage = 'past_medical_history';
        nextIndex = 0;
      }
    } else if (stage === 'past_medical_history') {
      updatedData.past_medical_history = [{ condition: answerText, status: 'yes' }];
      nextStage = 'surgical_history';
      nextIndex = 0;
    } else if (stage === 'surgical_history') {
      updatedData.surgical_history = [{ surgery: answerText }];
      nextStage = 'medications';
      nextIndex = 0;
    } else if (stage === 'medications') {
      updatedData.medications = [{ name: answerText }];
      nextStage = 'allergies';
      nextIndex = 0;
    } else if (stage === 'allergies') {
      updatedData.allergies = [{ allergen: answerText, type: 'drug' }];
      nextStage = 'family_history';
      nextIndex = 0;
    } else if (stage === 'family_history') {
      updatedData.family_history = [{ relation: 'Family', condition: answerText }];
      nextStage = 'personal_history';
      nextIndex = 0;
    } else if (stage === 'personal_history') {
      updatedData.personal_history = { habits: answerText };
      nextStage = 'completed';
    }

    setCollectedData(updatedData);
    setStage(nextStage);
    setQuestionIndex(nextIndex);

    // Save partial draft
    await ClinicalService.saveClinicalHistory({
      intake_session_id: session.id,
      patient_id: patient.id,
      chief_complaint: updatedData.chief_complaint || 'General medical consultation',
      hpi: updatedData.hpi,
      past_medical_history: updatedData.past_medical_history,
      surgical_history: updatedData.surgical_history,
      medications: updatedData.medications,
      allergies: updatedData.allergies,
      family_history: updatedData.family_history,
      personal_history: updatedData.personal_history,
    });

    if (nextStage === 'completed') {
      setIsFinishingInterview(true);
      await updateWorkflowState('HISTORY_COMPLETED', 4, updatedData);

      setTimeout(() => {
        router.push('/kiosk/documents');
      }, 900);
      return;
    }

    // Generate Next AI Question
    const nextQ = AIService.getNextQuestion(nextStage, nextIndex, nextCategory, language, 'MODERN_MEDICINE', updatedData.hpi);
    if (nextQ) {
      setCurrentQuestion(nextQ);
      const aiMsg: ConversationMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: nextQ.question,
        timestamp: new Date().toISOString(),
        stage: nextStage,
      };
      setMessages([...updatedMessages, aiMsg]);
      setAvatarState('speaking');
      speakText(nextQ.question);
    }

    setIsProcessingAnswer(false);
  };

  const handleExitInterview = () => {
    setShowExitConfirm(false);
    router.push('/');
  };

  if (sessionLoading || !patient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-500">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-2 sm:py-4">
      {/* Dynamic Progress Tracker (Modern Medicine 8 stages or AYUSH 6 stages) */}
      <ConversationProgress currentStage={stage} consultationMode={consultationMode} />

      {/* Top Banner with AI Avatar & Patient Details */}
      <div className="flex items-center justify-between gap-4 my-2">
        <div className="flex items-center gap-3">
          <AiAvatar state={avatarState} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-kiosk-navy">
                {isAyush ? '🪷 Ayush Kiosk Assistant' : '🏥 Medi AI Intake Assistant'}
              </h2>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isAyush
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-sky-100 text-sky-800 border-sky-300'
                }`}
              >
                {isAyush ? 'Ayurveda Intake' : 'Allopathic Intake'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Interviewing: <strong className="text-kiosk-navy">{patient.full_name}</strong> ({patient.age} yrs, {patient.gender})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Guidance Toggle */}
          <button
            type="button"
            onClick={toggleVoiceGuidance}
            title={isVoiceGuidanceEnabled ? 'Turn Voice Guidance Off' : 'Turn Voice Guidance On'}
            className={`px-3 py-2 rounded-full border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
              isVoiceGuidanceEnabled
                ? 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isVoiceGuidanceEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-sky-700" />
                <span>Voice On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Voice Off</span>
              </>
            )}
          </button>

          {/* Repeat Question Audio Prompt */}
          <AudioPromptButton textToSpeak={currentQuestion.question} label="Repeat Question" />

          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="px-3.5 py-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition"
          >
            {t.conversation.exitInterview}
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-slate-50/70 border-2 border-slate-200 rounded-3xl p-4 sm:p-6 mb-4 overflow-y-auto max-h-[380px] space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div
                  className={`w-10 h-10 rounded-xl text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md ${
                    isAyush ? 'bg-emerald-600' : 'bg-kiosk-blue'
                  }`}
                >
                  <Bot className="w-6 h-6" />
                </div>
              )}

              <div
                className={`max-w-xl p-5 rounded-3xl text-lg font-bold leading-relaxed shadow-sm ${
                  isAi
                    ? 'bg-white text-kiosk-navy border-2 border-slate-200 rounded-tl-none'
                    : 'bg-kiosk-navy text-white rounded-tr-none'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-xs font-semibold mt-2 ${
                    isAi ? 'text-slate-400' : 'text-sky-200'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {msg.inputMode && ` • via ${msg.inputMode}`}
                </span>
              </div>

              {!isAi && (
                <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              )}
            </div>
          );
        })}

        {isFinishingInterview && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-emerald-900">
              {isAyush ? 'Ayurvedic Intake Completed!' : 'Clinical Intake Completed!'}
            </h3>
            <p className="text-sm font-semibold text-emerald-700">
              Proceeding automatically to document upload...
            </p>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Interactive Input Modes (Voice / Text / Touch) */}
      {!isFinishingInterview && (
        <InputMode
          question={currentQuestion}
          onSubmit={handleAnswerSubmit}
          isProcessing={isProcessingAnswer}
        />
      )}

      {/* Red Flag Emergency Modal (Immediate Priority Alert for Both Modes) */}
      {activeRedFlag && (
        <RedFlagModal
          alert={activeRedFlag}
          onAcknowledge={() => setActiveRedFlag(null)}
        />
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-2xl font-black text-kiosk-navy">Leave Intake?</h3>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Your responses are automatically saved as a draft. You can resume this session anytime from your dashboard.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleExitInterview}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 font-bold text-white hover:bg-rose-700 transition"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
