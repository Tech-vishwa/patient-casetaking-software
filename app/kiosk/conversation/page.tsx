'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { AIService, ComplaintCategory } from '@/services/aiService';
import { RedFlagService } from '@/services/redFlagService';
import { ClinicalService } from '@/services/clinicalService';
import { mockDb } from '@/lib/supabase/mockDb';
import { AiAvatar } from '@/components/kiosk/AiAvatar';
import { ConversationProgress } from '@/components/kiosk/ConversationProgress';
import { InputMode } from '@/components/kiosk/InputMode';
import { RedFlagModal } from '@/components/kiosk/RedFlagModal';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import {
  ClinicalStage,
  ClinicalQuestion,
  ConversationMessage,
  RedFlagAlert,
} from '@/types/clinical';
import { Bot, User, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ConversationalHistoryPage() {
  const router = useRouter();
  const { language, t, speakText } = useLanguage();
  const { patient, session, consent, isLoading: sessionLoading, updateWorkflowState } = usePatientSession();

  const [stage, setStage] = useState<ClinicalStage>('chief_complaint');
  const [complaintCategory, setComplaintCategory] = useState<ComplaintCategory>('general');
  const [hpiQuestionIndex, setHpiQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<ClinicalQuestion>(
    AIService.getInitialGreeting(language)
  );

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeRedFlag, setActiveRedFlag] = useState<RedFlagAlert | null>(null);
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking'>('idle');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState<boolean>(false);
  const [isFinishingInterview, setIsFinishingInterview] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Collected structured answers across all 8 stages
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

  // Restore existing messages or load initial greeting on mount
  useEffect(() => {
    if (session && patient) {
      // Check if session already has stored messages
      mockDb.getConversationMessages(session.id).then((storedMsgs) => {
        if (storedMsgs && storedMsgs.length > 0) {
          setMessages(storedMsgs);
          // Restore clinical history draft
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
        } else if (messages.length === 0) {
          const initialGreeting = AIService.getInitialGreeting(language);
          setCurrentQuestion(initialGreeting);
          const initialMsg: ConversationMessage = {
            id: 'msg-init',
            sender: 'ai',
            text: initialGreeting.question,
            timestamp: new Date().toISOString(),
            stage: 'chief_complaint',
          };
          setMessages([initialMsg]);
          speakText(initialGreeting.question);
        }
      });
    }
  }, [session?.id, patient?.id]);

  // Re-translate current question when language changes without clearing messages
  useEffect(() => {
    if (stage === 'chief_complaint' && messages.length <= 1) {
      const updatedGreeting = AIService.getInitialGreeting(language);
      setCurrentQuestion(updatedGreeting);
    } else {
      const q = AIService.getNextQuestion(stage, hpiQuestionIndex, complaintCategory, language);
      if (q) {
        setCurrentQuestion(q);
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

    // 2. Deterministic Red Flag Safety Evaluation
    const redFlagEval = RedFlagService.evaluate(answerText);
    if (redFlagEval.hasRedFlag) {
      const highestRule = redFlagEval.matchedRules[0];
      const alert = await ClinicalService.logRedFlagAlert(
        session.id,
        patient.id,
        highestRule.category,
        highestRule.severity,
        redFlagEval.matchedKeywords
      );
      setActiveRedFlag(alert);
    }

    // 3. Process Answer & Advance Clinical State Machine
    let nextStage = stage;
    let nextIndex = hpiQuestionIndex;
    let nextCategory = complaintCategory;

    const newCollected = { ...collectedData };

    if (stage === 'chief_complaint') {
      newCollected.chief_complaint = answerText;
      nextCategory = AIService.classifyComplaint(answerText);
      setComplaintCategory(nextCategory);
      nextStage = 'hpi';
      nextIndex = 0;
    } else if (stage === 'hpi') {
      if (currentQuestion.fieldKey) {
        newCollected.hpi[currentQuestion.fieldKey] = answerText;
      }
      nextIndex += 1;
      const nextHpiQ = AIService.getNextQuestion('hpi', nextIndex, nextCategory, language);
      if (!nextHpiQ) {
        nextStage = 'past_medical_history';
      }
    } else if (stage === 'past_medical_history') {
      newCollected.past_medical_history.push({
        condition: answerText,
        status: answerText.toLowerCase().includes('no') ? 'no' : 'yes',
      });
      nextStage = 'surgical_history';
    } else if (stage === 'surgical_history') {
      newCollected.surgical_history.push({ surgery: answerText });
      nextStage = 'medications';
    } else if (stage === 'medications') {
      newCollected.medications.push({ name: answerText });
      nextStage = 'allergies';
    } else if (stage === 'allergies') {
      newCollected.allergies.push({
        allergen: answerText,
        type: answerText.toLowerCase().includes('food') ? 'food' : 'drug',
      });
      nextStage = 'family_history';
    } else if (stage === 'family_history') {
      newCollected.family_history.push({ relation: 'Family', condition: answerText });
      nextStage = 'personal_history';
    } else if (stage === 'personal_history') {
      newCollected.personal_history.diet = answerText;
      nextStage = 'completed';
    }

    setCollectedData(newCollected);
    setStage(nextStage);
    setHpiQuestionIndex(nextIndex);

    // Save conversation progress and draft state asynchronously
    await ClinicalService.saveConversation(session.id, patient.id, updatedMessages, language);
    await updateWorkflowState('HISTORY_IN_PROGRESS', 3, newCollected);

    // 4. Check if interview is complete -> AUTO-TRANSITION TO DOCUMENTS
    if (nextStage === 'completed') {
      setIsFinishingInterview(true);
      setAvatarState('speaking');

      // Save final structured clinical history
      await ClinicalService.saveClinicalHistory({
        intake_session_id: session.id,
        patient_id: patient.id,
        chief_complaint: newCollected.chief_complaint,
        hpi: newCollected.hpi,
        past_medical_history: newCollected.past_medical_history,
        surgical_history: newCollected.surgical_history,
        medications: newCollected.medications,
        allergies: newCollected.allergies,
        family_history: newCollected.family_history,
        personal_history: newCollected.personal_history,
      });

      await updateWorkflowState('DOCUMENTS_IN_PROGRESS', 4, newCollected);
      speakText('Health interview completed. Moving to medical documents stage.');

      // Smooth auto-transition to Document upload stage
      setTimeout(() => {
        router.push('/kiosk/documents');
      }, 900);
      return;
    }

    // 5. Generate Next AI Question automatically
    const nextQ = AIService.getNextQuestion(nextStage, nextIndex, nextCategory, language);
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
    router.push('/patient/dashboard');
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
      {/* 8-Stage Progress Tracker */}
      <ConversationProgress currentStage={stage} />

      {/* Top Banner with AI Avatar & Patient Name */}
      <div className="flex items-center justify-between gap-4 my-2">
        <div className="flex items-center gap-3">
          <AiAvatar state={avatarState} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-kiosk-navy">Medi AI Intake Assistant</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Interviewing: <strong className="text-kiosk-navy">{patient.full_name}</strong> ({patient.age} yrs, {patient.gender})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AudioPromptButton textToSpeak={currentQuestion.question} />
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition"
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
                <div className="w-10 h-10 rounded-xl bg-kiosk-blue text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
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
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Thinking / Processing State */}
        {isProcessingAnswer && !isFinishingInterview && (
          <div className="flex items-center gap-2 p-3 bg-sky-50 text-kiosk-blue rounded-2xl border border-sky-200 font-bold text-sm max-w-xs animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI Thinking & Generating Next Question...</span>
          </div>
        )}

        {/* Interview Finishing Banner */}
        {isFinishingInterview && (
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border-2 border-emerald-300 font-bold text-base flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Clinical Interview Complete! Transitioning to Document Upload...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Multimodal Input Section (Touch Options / Voice / Type) */}
      {!isFinishingInterview && (
        <InputMode
          question={currentQuestion}
          onSubmitAnswer={handleAnswerSubmit}
          disabled={isProcessingAnswer}
          onListeningStateChange={(isList) => setAvatarState(isList ? 'listening' : 'idle')}
        />
      )}

      {/* Deterministic Red Flag Safety Modal */}
      {activeRedFlag && (
        <RedFlagModal alert={activeRedFlag} onDismiss={() => setActiveRedFlag(null)} />
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-slate-300">
            <h3 className="text-2xl font-bold text-kiosk-navy mb-2">
              {t.conversation.exitConfirmTitle}
            </h3>
            <p className="text-base text-slate-600 mb-6 leading-relaxed">
              {t.conversation.exitConfirmBody}
            </p>
            <div className="flex gap-4">
              <KioskButton
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1"
              >
                Stay & Continue
              </KioskButton>
              <KioskButton
                variant="secondary"
                onClick={handleExitInterview}
                className="flex-1"
              >
                Exit to Dashboard
              </KioskButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
