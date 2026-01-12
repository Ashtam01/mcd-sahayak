"use client";

import { useState } from 'react';
import { Send, Phone, MessageSquare } from 'lucide-react';

export default function BroadcastPanel() {
    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<'call' | 'sms'>('sms');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleBroadcast = async () => {
        if (!message || !phone) return;

        setLoading(true);
        setStatus('idle');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, phone, type }),
            });

            if (!response.ok) throw new Error('Failed to send broadcast');

            setStatus('success');
            setMessage('');
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Send className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Broadcast Announcement</h2>
            </div>

            <div className="space-y-4">

                {/* Toggle Type */}
                <div className="flex bg-black/20 p-1 rounded-xl">
                    <button
                        onClick={() => setType('sms')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === 'sms'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Send SMS
                    </button>
                    <button
                        onClick={() => setType('call')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === 'call'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Phone className="w-4 h-4" />
                        Phone Call
                    </button>
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={type === 'sms' ? "Type SMS content..." : "Type the message the agent will speak..."}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Recipient Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <button
                    onClick={handleBroadcast}
                    disabled={loading || !message || !phone}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
            ${loading || !message || !phone
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        }`}
                >
                    {loading ? 'Sending...' : (type === 'sms' ? 'Send SMS' : 'Start Call')}
                    {!loading && <Send className="w-4 h-4" />}
                </button>

                {status === 'success' && (
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm text-center">
                        {type === 'sms' ? 'SMS Sent Successfully!' : 'Call Initiated Successfully!'}
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm text-center">
                        Failed. Check console/logs.
                    </div>
                )}
            </div>
        </div>
    );
}

