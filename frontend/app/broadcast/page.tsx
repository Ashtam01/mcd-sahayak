'use client';

import { useState } from 'react';
import {
   Megaphone, Send, Zap, MessageSquare, Phone
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const ZONES = [
   { value: 'all', label: 'All Zones' },
   { value: 'north', label: 'North Delhi' },
   { value: 'south', label: 'South Delhi' },
];

const broadcastHistory = [
   { id: 1, title: 'Water Supply Alert', message: 'Disruption in Rohini Sec-3.', channel: 'sms', sentAt: '10:30 AM', status: 'completed', priority: 'high' },
   { id: 2, title: 'Tax Reminder', message: 'Property tax due date extended.', channel: 'call', sentAt: 'Yesterday', status: 'completed', priority: 'normal' },
];

export default function BroadcastPage() {
   const [isUrgent, setIsUrgent] = useState(false);
   const [messageBody, setMessageBody] = useState('');
   const [channel, setChannel] = useState('sms');
   const [phone, setPhone] = useState('');
   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

   const handleBroadcast = async () => {
      if (!messageBody || !phone) return;

      setLoading(true);
      setStatus('idle');

      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/broadcast`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: messageBody, phone, type: channel }),
         });

         if (!response.ok) throw new Error('Failed to send broadcast');

         setStatus('success');
         setMessageBody('');
         // Keep phone number for convenience
      } catch (error) {
         console.error(error);
         setStatus('error');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex flex-col h-[calc(100vh-2rem)] space-y-6 p-2 max-w-[1600px] mx-auto">
         <div className="flex flex-col md:flex-row gap-6">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-blue-600" /> Broadcast Hub
               </h1>
               <p className="text-sm text-slate-500 mt-1">Mass Citizen Communication System</p>
            </div>
         </div>

         <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* COMPOSER */}
            <div className={`flex flex-col gap-4 lg:w-7/12 transition-all duration-300 ${isUrgent ? 'ring-2 ring-red-500 rounded-2xl p-1' : ''}`}>
               <Card className="flex-1 flex flex-col border-slate-200 shadow-md overflow-hidden">
                  <div className={`p-4 border-b flex justify-between items-center ${isUrgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-white text-blue-600 border border-slate-200'}`}>
                           <Zap className="w-5 h-5" />
                        </div>
                        <h2 className={`font-bold ${isUrgent ? 'text-red-700' : 'text-slate-800'}`}>
                           {isUrgent ? 'EMERGENCY BROADCAST' : 'New Campaign'}
                        </h2>
                     </div>
                     <button onClick={() => setIsUrgent(!isUrgent)} className={`px-3 py-1 rounded-full text-xs font-bold border ${isUrgent ? 'bg-red-500 text-white border-red-600' : 'bg-slate-200 text-slate-600'}`}>
                        {isUrgent ? 'URGENT MODE ON' : 'Normal Mode'}
                     </button>
                  </div>

                  <div className="flex-1 p-6 flex gap-6 overflow-y-auto">
                     <div className="flex-1 space-y-5">
                        <div className="space-y-3">
                           <Label>Target Audience</Label>
                           <div className="flex gap-3">
                              <Select defaultValue="all"><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{ZONES.map(z => <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>)}</SelectContent></Select>

                              <Select value={channel} onValueChange={setChannel}>
                                 <SelectTrigger className="w-full">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="sms">SMS</SelectItem>
                                    <SelectItem value="call">Phone Call</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <Label>Recipient Phone (Test Mode)</Label>
                           <Input
                              placeholder="+91..."
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                           />
                           <p className="text-[10px] text-slate-400">Enter a number to test this broadcast before sending to all zone citizens.</p>
                        </div>

                        <div className="space-y-3">
                           <Label>Message</Label>
                           <textarea
                              className={`w-full h-32 p-3 rounded-lg border text-sm resize-none focus:ring-2 focus:outline-none transition-all ${isUrgent ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                              placeholder="Type message..."
                              value={messageBody}
                              onChange={e => setMessageBody(e.target.value)}
                           />
                        </div>
                     </div>

                     {/* Phone Preview */}
                     <div className="w-[240px] hidden xl:block">
                        <div className="mockup-phone border-gray-800 bg-gray-900 rounded-[30px] p-2 h-[450px] shadow-xl border-[8px] relative">
                           <div className="h-full bg-white rounded-[20px] overflow-hidden flex flex-col p-3 bg-slate-100">
                              <div className="bg-white p-3 rounded-lg shadow-sm text-xs">
                                 {isUrgent && <p className="text-red-600 font-bold text-[10px] mb-1">⚠️ EMERGENCY ALERT</p>}
                                 <p>{messageBody || 'Message preview...'}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                     <div>
                        {status === 'success' && <span className="text-green-600 text-sm font-medium">Broadcast Sent Successfully!</span>}
                        {status === 'error' && <span className="text-red-600 text-sm font-medium">Failed to send broadcast.</span>}
                     </div>
                     <Button
                        onClick={handleBroadcast}
                        disabled={loading || !messageBody || !phone}
                        className={`${isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                     >
                        {loading ? 'Sending...' : 'Send Broadcast'}
                        {!loading && <Send className="w-4 h-4 ml-2" />}
                     </Button>
                  </div>
               </Card>
            </div>

            {/* HISTORY */}
            <div className="flex-1 flex flex-col gap-4">
               <Card className="flex-1 border-slate-200">
                  <div className="p-3 border-b border-slate-100 bg-slate-50"><h3 className="text-xs font-bold text-slate-500 uppercase">Recent Logs</h3></div>
                  <div className="p-2 space-y-2">
                     {broadcastHistory.map(item => (
                        <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-white">
                           <div className="flex justify-between mb-1">
                              <span className="text-[10px] text-slate-400">{item.sentAt}</span>
                              <span className={`text-[10px] font-bold px-1.5 rounded ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.status}</span>
                           </div>
                           <h4 className="text-sm font-semibold">{item.title}</h4>
                           <div className="mt-1 flex items-center gap-1.5">
                              {item.channel === 'sms' ? <MessageSquare className="w-3 h-3 text-slate-400" /> : <Phone className="w-3 h-3 text-slate-400" />}
                              <span className="text-xs text-slate-500 capitalize">{item.channel}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
}