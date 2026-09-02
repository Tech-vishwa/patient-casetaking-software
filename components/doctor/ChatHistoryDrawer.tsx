'use client';

import React from 'react';
import { X, MessageSquare, Mic, Keyboard, Touchpad, Bot, User, AlertTriangle } from 'lucide-react';
import { ConversationMessage } from '@/types/clinical';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ConversationMessage[];
  patientName: string;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  patientName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l-2 border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-kiosk-navy">Original AI Intake Conversation</h3>
              <p className="text-xs font-bold text-slate-500">
                Patient: <span className="text-kiosk-blue">{patientName}</span> ({messages.length} exchanges recorded)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message Logs */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold">No conversation message logs found for this session.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAi = msg.sender === 'ai';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-kiosk-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-3xl max-w-[80%] space-y-1.5 shadow-sm border ${
                      isAi
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-kiosk-blue text-white border-sky-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px] opacity-80">
                      <span className="font-black uppercase tracking-wider">
                        {isAi ? 'Medi AI Assistant' : patientName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {msg.inputMode === 'voice' && <span title="Voice spoken"><Mic className="w-3.5 h-3.5" /></span>}
                        {msg.inputMode === 'quick_select' && <span title="Touchscreen selected"><Touchpad className="w-3.5 h-3.5" /></span>}
                        {msg.inputMode === 'typed' && <span title="Keyboard typed"><Keyboard className="w-3.5 h-3.5" /></span>}
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
          >
            Close Transcript
          </button>
        </div>
      </div>
    </div>
  );
};
