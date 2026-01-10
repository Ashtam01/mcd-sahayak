'use client';

import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  MapPin,
  FileText,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VoiceAgentProps {
  publicKey: string;
  assistantId: string;
}

interface ComplaintCreated {
  id: string;
  complaint_number: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
}

export default function VoiceAgent({ publicKey, assistantId }: VoiceAgentProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Ready to help');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [lastCreatedComplaint, setLastCreatedComplaint] = useState<ComplaintCreated | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Listen for real-time complaint creation
  useEffect(() => {
    const channel = supabase
      .channel('voice-complaints')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'complaints',
          filter: 'source=eq.voice'
        },
        (payload) => {
          console.log('🎉 New voice complaint created:', payload.new);
          setLastCreatedComplaint({
            id: payload.new.id,
            complaint_number: payload.new.complaint_number,
            category: payload.new.category,
            location: payload.new.location,
            status: payload.new.status,
            created_at: payload.new.created_at,
          });
          setIsProcessing(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!publicKey) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setIsCallActive(true);
      setStatus('🟢 Connected');
      setTranscript([]);
      setLastCreatedComplaint(null);
    });

    vapi.on('call-end', () => {
      setIsCallActive(false);
      setStatus('Call ended');
      setVolumeLevel(0);
      setIsProcessing(true); // Show processing while webhook creates complaint
      
      // Wait for complaint creation (max 10 seconds)
      setTimeout(() => {
        setIsProcessing(false);
      }, 10000);
    });

    vapi.on('speech-start', () => {
      setStatus('🎤 Listening...');
    });

    vapi.on('speech-end', () => {
      setStatus('🤖 Processing...');
    });

    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const role = message.role === 'assistant' ? '🤖' : '👤';
        const speaker = message.role === 'assistant' ? 'Sampark' : 'You';
        const newLine = `${role} ${speaker}: ${message.transcript}`;
        
        setTranscript(prev => {
          const lastLine = prev[prev.length - 1];
          // Update last line if same speaker (streaming)
          if (lastLine && lastLine.startsWith(role)) {
            return [...prev.slice(0, -1), newLine];
          }
          return [...prev, newLine];
        });
      }
      
      // Detect if agent mentioned complaint number
      if (message.type === 'transcript' && message.role === 'assistant') {
        const text = message.transcript?.toLowerCase() || '';
        if (text.includes('complaint') && text.includes('registered')) {
          setStatus('✅ Complaint Registered!');
        }
      }
    });

    vapi.on('volume-level', (level) => {
      setVolumeLevel(level);
    });

    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      setStatus('❌ Error - Try again');
      setIsCallActive(false);
      setIsProcessing(false);
    });

    return () => {
      vapi.stop();
    };
  }, [publicKey]);

  const startCall = async () => {
    if (!vapiRef.current || !assistantId) {
      setStatus('⚠️ Not configured');
      return;
    }
    setStatus('📞 Connecting...');
    setLastCreatedComplaint(null);
    
    try {
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error('Failed to start call:', error);
      setStatus('❌ Connection failed');
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
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sampark Voice Agent</h3>
              <p className="text-blue-100 text-sm">AI-Powered Complaint Helpline</p>
            </div>
          </div>
          {isCallActive && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <Volume2 className="w-4 h-4 text-white" />
              <div className="w-16 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${Math.min(volumeLevel * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isCallActive 
              ? 'bg-green-100 text-green-700' 
              : status.includes('Error') || status.includes('failed')
              ? 'bg-red-100 text-red-700'
              : isProcessing
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {isCallActive && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            {isProcessing && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {status}
          </span>
          
          {isCallActive && (
            <span className="text-sm text-slate-500">
              <Clock className="w-4 h-4 inline mr-1" />
              Live Call
            </span>
          )}
        </div>

        {/* Transcript Area */}
        <div className="bg-slate-50 rounded-xl p-4 h-56 overflow-y-auto mb-4 border border-slate-200">
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Mic className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-center font-medium">
                {isCallActive 
                  ? 'Listening for speech...' 
                  : 'Start a call to register a complaint'}
              </p>
              <p className="text-sm mt-1">Speak in Hindi or English</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcript.map((line, i) => (
                <div 
                  key={i} 
                  className={`flex gap-2 ${
                    line.startsWith('🤖') ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    line.startsWith('🤖') 
                      ? 'bg-blue-100 text-blue-900 rounded-tl-sm' 
                      : 'bg-green-100 text-green-900 rounded-tr-sm'
                  }`}>
                    {line}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>

        {/* Complaint Created Banner */}
        {lastCreatedComplaint && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800">✅ Complaint Registered!</p>
                <div className="mt-2 space-y-1 text-sm text-green-700">
                  <p className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-mono font-bold">{lastCreatedComplaint.complaint_number}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {lastCreatedComplaint.category}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {lastCreatedComplaint.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Banner */}
        {isProcessing && !lastCreatedComplaint && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              <div>
                <p className="font-medium text-amber-800">Processing your complaint...</p>
                <p className="text-sm text-amber-600">AI is analyzing your call to create a ticket</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!isCallActive ? (
            <button
              onClick={startCall}
              disabled={!publicKey || !assistantId}
              className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              <Phone className="w-5 h-5" />
              Start Call
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`px-6 py-4 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                  isMuted 
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' 
                    : 'bg-slate-100 text-slate-700 border-2 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={endCall}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-500/25"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center">
            🎤 Say: &quot;Mere ghar ke paas kachra hai&quot; or &quot;There&apos;s garbage near my house&quot;
          </p>
          <p className="text-xs text-slate-400 text-center mt-1">
            The AI will ask for your location and create a complaint automatically
          </p>
        </div>
      </div>
    </div>
  );
}
