'use client';

import React from 'react';
import { Bot, Sparkles, Volume2, Mic } from 'lucide-react';

interface AiAvatarProps {
  state?: 'idle' | 'speaking' | 'listening' | 'thinking';
  name?: string;
  className?: string;
}

export const AiAvatar: React.FC<AiAvatarProps> = ({
  state = 'idle',
  name = 'Medi',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative">
        {/* Outer Glow / Animation Pulse */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all duration-300 ${
            state === 'speaking'
              ? 'bg-gradient-to-br from-kiosk-blue to-cyan-500 shadow-xl shadow-sky-500/40 ring-4 ring-sky-300 animate-pulse'
              : state === 'listening'
              ? 'bg-gradient-to-br from-rose-500 to-amber-500 shadow-xl shadow-rose-500/40 ring-4 ring-rose-200 animate-bounce'
              : state === 'thinking'
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/40 ring-4 ring-indigo-200'
              : 'bg-gradient-to-br from-kiosk-navy to-kiosk-blue shadow-md'
          }`}
        >
          {state === 'speaking' ? (
            <Volume2 className="w-9 h-9 sm:w-11 sm:h-11 text-white animate-pulse" />
          ) : state === 'listening' ? (
            <Mic className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          ) : state === 'thinking' ? (
            <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 text-white animate-spin" />
          ) : (
            <Bot className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
          )}
        </div>

        {/* Status Indicator Dot */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
            state === 'listening'
              ? 'bg-rose-500 animate-ping'
              : state === 'speaking'
              ? 'bg-sky-400'
              : state === 'thinking'
              ? 'bg-purple-500'
              : 'bg-emerald-500'
          }`}
        />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl sm:text-2xl font-black text-kiosk-navy tracking-tight">{name}</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800">
            AI Assistant
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-500">
          {state === 'listening'
            ? 'Listening to your voice...'
            : state === 'speaking'
            ? 'Speaking instructions...'
            : state === 'thinking'
            ? 'Analyzing responses...'
            : 'Clinical History Assistant'}
        </p>
      </div>
    </div>
  );
};
