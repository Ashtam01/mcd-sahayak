'use client';

import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceAgentProps {
  publicKey: string;
  assistantId: string;
}

export default function VoiceAgent({ publicKey, assistantId }: VoiceAgentProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Click to call');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setIsCallActive(true);
      setStatus('Connected');
      setTranscript([]);
    });

    vapi.on('call-end', () => {
      setIsCallActive(false);
      setStatus('Call ended');
      setVolumeLevel(0);
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const role = message.role === 'assistant' ? '🤖 Agent' : '👤 You';
        const newLine = `${role}: ${message.transcript}`;
        setTranscript(prev => {
          // Update last line if same role, else add new
          if (prev.length > 0 && prev[prev.length - 1].startsWith(role)) {
            return [...prev.slice(0, -1), newLine];
          }
          return [...prev, newLine];
        });
      }
    });

    vapi.on('volume-level', (level) => {
      setVolumeLevel(level);
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      setStatus('Error - Try again');
      setIsCallActive(false);
    });

    return () => {
      vapi.stop();
    };
  }, [publicKey]);

  const startCall = async () => {
    if (!vapiRef.current || !assistantId) {
      setStatus('Not configured');
      return;
    }
    setStatus('Connecting...');
    try {
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error('Failed to start call:', error);
      setStatus('Failed to connect');
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Phone className="w-5 h-5 text-green-400" />
          </div>
          Sampark Voice Agent
        </h3>
        {isCallActive && (
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-green-400" />
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: `${Math.min(volumeLevel * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          isCallActive 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : status === 'Error - Try again'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
        }`}>
          {isCallActive && (
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          )}
          {status}
        </span>
      </div>

      {/* Transcript Area */}
      <div className="bg-slate-900/60 rounded-xl p-4 h-52 overflow-y-auto mb-4 text-sm border border-slate-700/50">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Mic className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-center">
              {isCallActive 
                ? 'Listening...' 
                : 'Start a call to speak with Sampark AI'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transcript.map((line, i) => (
              <p 
                key={i} 
                className={`${
                  line.startsWith('🤖') 
                    ? 'text-blue-400' 
                    : 'text-green-400'
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isCallActive ? (
          <button
            onClick={startCall}
            disabled={!publicKey || !assistantId}
            className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-green-500/20"
          >
            <Phone className="w-5 h-5" />
            Start Call
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`px-5 py-3.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                isMuted 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={endCall}
              className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-500/20"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-slate-500 mt-3 text-center">
        Speak in Hindi or English • Say &quot;Namaste&quot; to start
      </p>
    </div>
  );
}
