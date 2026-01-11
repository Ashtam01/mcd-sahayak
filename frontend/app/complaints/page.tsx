'use client';

import { useState, useEffect } from 'react';
import {
   Trash2, Droplets, Lightbulb, Construction, Bug, TreeDeciduous,
   Play, Pause, Volume2, UserCheck, CheckCircle2, MessageCircle,
   MapPin, Clock, Phone, User, FileText, Filter, RefreshCw,
   Headphones, MessageSquare, Loader2, X, AlertTriangle,
   ArrowRight, Activity, Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase, type Complaint } from '@/lib/supabase';
import { useZoneStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { fetchComplaints, updateComplaint } from '@/lib/api';
// IMPORT THE NEW COMPONENT
import AIAnalysisPanel from '@/components/complaints/AIAnalysisPanel';

// --- Types ---
interface ComplaintWithCall extends Complaint {
   call_duration?: number;
   call_transcript?: string;
   call_summary?: string;
   recording_url?: string;
   source?: string;
   _rawId?: string;
}

// --- Constants & Config ---
const CATEGORIES = [
   'Garbage', 'Water', 'Street Light', 'Road',
   'Pest Control', 'Sewage', 'Trees', 'Others'
];

const categoryConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
   Garbage: { icon: Trash2, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
   Water: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
   'Street Light': { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
   Streetlight: { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
   Road: { icon: Construction, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
   'Pest Control': { icon: Bug, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
   Sewage: { icon: Droplets, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
   Trees: { icon: TreeDeciduous, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
   Others: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

function getStatusStyle(status: string) {
   const s = status?.toLowerCase().replace(' ', '-');
   switch (s) {
      case 'open': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'escalated': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
   }
}

function formatTime(dateString: string) {
   const date = new Date(dateString);
   const now = new Date();
   const diff = (now.getTime() - date.getTime()) / 1000;
   if (diff < 60) return 'Just now';
   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
   return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDuration(seconds: number | undefined) {
   if (!seconds) return '0:00';
   const mins = Math.floor(seconds / 60);
   const secs = seconds % 60;
   return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ComplaintsPage() {
   const [complaints, setComplaints] = useState<ComplaintWithCall[]>([]);
   const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithCall | null>(null);
   const [isLoadingDetails, setIsLoadingDetails] = useState(false);
   const [statusFilter, setStatusFilter] = useState('all');
   const [categoryFilter, setCategoryFilter] = useState('all');
   const [regionFilter, setRegionFilter] = useState('all');
   const [searchQuery, setSearchQuery] = useState('');
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   const { selectedZone } = useZoneStore();
   const { toast } = useToast();



   useEffect(() => {
      async function loadComplaints() {
         setIsLoading(true);
         try {
            const data = await fetchComplaints({
               zone: regionFilter,
               status: statusFilter,
               limit: 100
            });

            // Use local filtering for category/search until backend supports it fully if needed
            // Or if the backend supports it, pass it.
            // Current API fetchComplaints doesn't take category, so we filter locally

            const mapped = data.map((c: any) => ({
               ...c,
               id: c.complaint_number || c.id,
               status: (c.status || 'Open').toLowerCase().replace(' ', '-'),
               priority: c.priority || 'medium',
               title: c.title || `${c.category} Report @ ${c.location?.split(',')[0]}`,
               _rawId: c.id
            })) as any[];
            setComplaints(mapped);
            if (mapped.length > 0 && !selectedComplaint) handleSelectComplaint(mapped[0]);
         } catch (err) { console.error('Fetch error:', err); } finally { setIsLoading(false); }
      }
      loadComplaints();
   }, [selectedZone, statusFilter, categoryFilter, regionFilter]);

   const handleSelectComplaint = async (complaint: ComplaintWithCall) => {
      setSelectedComplaint(complaint);
      setIsLoadingDetails(true);
      try {
         if (complaint.source === 'voice') {
            const { data } = await supabase.from('calls').select('*').eq('complaint_id', complaint._rawId).single();
            if (data) {
               setSelectedComplaint(prev => prev ? ({ ...prev, call_duration: data.duration_seconds, call_transcript: data.transcript, call_summary: data.summary, recording_url: data.recording_url }) : null);
            }
         }
      } catch (e) { console.error(e); }
      setIsLoadingDetails(false);
   };

   const updateStatus = async (status: string, assignedTo?: string) => {
      if (!selectedComplaint) return;
      try {
         // Use Backend API to update status (Bypasses RLS issues)
         // Note: status from UI is 'in-progress', 'resolved'. Backend expects this and converts to Title Case.
         await updateComplaint(selectedComplaint._rawId || selectedComplaint.id, {
            status: status,
            assigned_to: assignedTo
         });

         // Update local state for immediate UI feedback
         const displayStatus = status === 'in-progress' ? 'In Progress' : status === 'resolved' ? 'Resolved' : status;

         setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: displayStatus.toLowerCase().replace(' ', '-'), assigned_to: assignedTo || c.assigned_to } as any : c));
         setSelectedComplaint(prev => prev ? ({ ...prev, status: displayStatus.toLowerCase().replace(' ', '-'), assigned_to: assignedTo || prev.assigned_to } as any) : null);

         toast({ title: 'Status Updated', description: `Complaint marked as ${displayStatus}.` });
      } catch (e) {
         console.error(e);
         toast({ title: 'Update Failed', variant: 'destructive', description: 'Could not update status. Please try again.' });
      }
   };

   const filtered = complaints.filter(c =>
      (searchQuery === '' || JSON.stringify(c).toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === 'all' || c.category === categoryFilter)
   );
   const getCatConfig = (cat: string) => categoryConfig[cat] || categoryConfig['Others'];

   return (
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 gap-4">
         <header className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
               <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Grievance Inbox
               </h1>
               <p className="text-xs text-slate-500 mt-1">Real-time feed • {complaints.length} Total Records</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
               <div className="relative group w-full md:w-64">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Filter className="h-4 w-4 text-slate-400" /></div>
                  <Input className="pl-9 bg-slate-50" placeholder="Search ID, Area, Keyword..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
               </div>
               <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px] text-xs h-9 bg-slate-50"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
               </Select>
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px] text-xs h-9 bg-slate-50"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent>
               </Select>
            </div>
         </header>

         <div className="flex-1 flex gap-4 overflow-hidden">
            <Card className="w-full md:w-[400px] flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
               <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incoming Feed</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.location.reload()}><RefreshCw className="h-3 w-3" /></Button>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div> : filtered.length === 0 ? <div className="text-center p-8 text-slate-400 text-sm">No complaints found.</div> : filtered.map(c => {
                     const config = getCatConfig(c.category);
                     const Icon = config.icon;
                     const isActive = selectedComplaint?.id === c.id;
                     return (
                        <div key={c.id} onClick={() => handleSelectComplaint(c)} className={`group p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}>
                           <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                 <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusStyle(c.status)}`}>{c.status}</span>
                                 {c.source === 'voice' && <Headphones className="w-3 h-3 text-purple-500" />}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{formatTime(c.created_at)}</span>
                           </div>
                           <div className="flex items-start gap-3">
                              <div className={`mt-1 p-1.5 rounded-md ${config.bg} ${config.color}`}><Icon className="w-4 h-4" /></div>
                              <div className="flex-1 min-w-0">
                                 <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{c.category} Issue</h4>
                                 <p className="text-xs text-slate-500 truncate mt-0.5">{c.location}</p>
                                 <p className="text-[10px] text-slate-400 mt-1 truncate">ID: {c.id}</p>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </Card>

            <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
               {selectedComplaint ? (
                  <>
                     <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                        <div className="flex gap-4">
                           <div className={`p-3 rounded-xl border shadow-sm ${getCatConfig(selectedComplaint.category).bg} ${getCatConfig(selectedComplaint.category).border}`}>
                              {(() => { const Icon = getCatConfig(selectedComplaint.category).icon; return <Icon className={`w-6 h-6 ${getCatConfig(selectedComplaint.category).color}`} />; })()}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h2 className="text-lg font-bold text-slate-800">{selectedComplaint.title}</h2>
                                 {selectedComplaint.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200"><MapPin className="w-3 h-3" /> {selectedComplaint.location}</span>
                                 <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200"><Calendar className="w-3 h-3" /> {new Date(selectedComplaint.created_at).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(selectedComplaint.status)}`}>{selectedComplaint.status.toUpperCase()}</div>
                           <p className="text-xs font-mono text-slate-400">Ref: {selectedComplaint.id}</p>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoadingDetails ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div> : (
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-6">
                                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> AI Diagnostics</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                       <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                          <p className="text-[10px] text-slate-400">Sentiment</p>
                                          <div className="flex items-center gap-2 mt-1"><div className={`w-2 h-2 rounded-full ${selectedComplaint.sentiment === 'Negative' ? 'bg-red-500' : 'bg-green-500'}`}></div><span className="font-semibold text-sm">{selectedComplaint.sentiment || 'Neutral'}</span></div>
                                       </div>
                                       <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                          <p className="text-[10px] text-slate-400">Urgency Score</p>
                                          <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[70%]"></div></div><span className="font-semibold text-sm">High</span></div>
                                       </div>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{selectedComplaint.ai_summary || selectedComplaint.description}</p>
                                 </div>

                                 {/* --- INSERTED AI ANALYSIS PANEL --- */}
                                 <AIAnalysisPanel />
                                 {/* ---------------------------------- */}

                                 {selectedComplaint.source === 'voice' && (
                                    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                                       <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Headphones className="w-4 h-4" /> Audio Evidence</h3>
                                       {selectedComplaint.recording_url && (
                                          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-purple-100 shadow-sm mb-3">
                                             <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700">{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}</button>
                                             <div className="flex-1 space-y-1"><div className="h-6 flex items-center gap-0.5 opacity-50">{[...Array(20)].map((_, i) => (<div key={i} className="w-1 bg-purple-600 rounded-full" style={{ height: `${Math.random() * 100}%` }}></div>))}</div></div>
                                             <span className="text-xs font-mono text-purple-700">{formatDuration(selectedComplaint.call_duration)}</span>
                                          </div>
                                       )}
                                       {selectedComplaint.call_transcript && (<div className="bg-white rounded-lg border border-purple-100 p-3 max-h-40 overflow-y-auto"><p className="text-xs text-slate-500 font-mono mb-2">TRANSCRIPT LOG:</p><p className="text-sm text-slate-800 whitespace-pre-wrap">{selectedComplaint.call_transcript}</p></div>)}
                                    </div>
                                 )}
                              </div>
                              <div className="space-y-6">
                                 <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Citizen Profile</h3>
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User className="w-6 h-6" /></div>
                                       <div><p className="font-semibold text-slate-900">{selectedComplaint.citizen_name || 'Anonymous'}</p><p className="text-sm text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedComplaint.citizen_phone || 'N/A'}</p></div>
                                    </div>
                                 </div>
                                 <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Dispatch Controls</h3>
                                    <div className="space-y-3">
                                       <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2"><span className="text-slate-400">Current Assignee:</span><span className="font-mono">{selectedComplaint.assigned_to || 'Unassigned'}</span></div>
                                       <div className="grid grid-cols-2 gap-3 mt-4">
                                          <Button onClick={() => updateStatus('in-progress')} disabled={selectedComplaint.status !== 'open'} className="bg-blue-600 hover:bg-blue-700 text-white">Mark In Progress</Button>
                                          <Button onClick={() => updateStatus('resolved')} disabled={selectedComplaint.status === 'resolved'} className="bg-emerald-600 hover:bg-emerald-700 text-white">Resolve</Button>
                                       </div>
                                       <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white mt-2"><MessageCircle className="w-4 h-4 mr-2" /> Send WhatsApp Update</Button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                     <div className="p-4 bg-slate-50 rounded-full mb-4"><FileText className="w-10 h-10 opacity-50" /></div>
                     <p className="font-medium">Select a grievance to view details</p>
                     <p className="text-sm">Select from the feed on the left</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}