'use client';

import { useState, useEffect } from 'react';
import {
  Trash2,
  Droplets,
  Lightbulb,
  Construction,
  Bug,
  TreeDeciduous,
  Play,
  Pause,
  Volume2,
  UserCheck,
  CheckCircle2,
  MessageCircle,
  MapPin,
  Clock,
  Phone,
  User,
  FileText,
  Filter,
  RefreshCw,
  Headphones,
  MessageSquare,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase, type Complaint } from '@/lib/supabase';
import { useZoneStore, ZONES as ZONE_OPTIONS } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

// Extended complaint type with call data
interface ComplaintWithCall extends Complaint {
  call_duration?: number;
  call_transcript?: string;
  call_summary?: string;
  recording_url?: string;
  source?: string;
  _rawId?: string;
}

// Category icons mapping
const categoryIcons: Record<string, { icon: typeof Trash2; color: string; bg: string }> = {
  Garbage: { icon: Trash2, color: 'text-amber-600', bg: 'bg-amber-50' },
  Water: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Street Light': { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  Streetlight: { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  Road: { icon: Construction, color: 'text-orange-600', bg: 'bg-orange-50' },
  'Pest Control': { icon: Bug, color: 'text-red-600', bg: 'bg-red-50' },
  Sewage: { icon: Droplets, color: 'text-purple-600', bg: 'bg-purple-50' },
  Trees: { icon: TreeDeciduous, color: 'text-green-600', bg: 'bg-green-50' },
  Others: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
};

// All categories for filter
const CATEGORIES = [
  'Garbage',
  'Water',
  'Street Light',
  'Streetlight',
  'Road',
  'Pest Control',
  'Sewage',
  'Trees',
  'Others',
];

// Map zone values to display names (using zones from store to avoid duplication)
const ZONES = ZONE_OPTIONS.map(z => z.label.replace('🏛️ ', '').replace('🏢 ', ''));

function getStatusStyle(status: string) {
  const normalizedStatus = status?.toLowerCase().replace(' ', '-');
  switch (normalizedStatus) {
    case 'open':
      return 'bg-amber-100 text-amber-700';
    case 'in-progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-700';
    case 'resolved':
    case 'closed':
      return 'bg-emerald-100 text-emerald-700';
    case 'escalated':
    case 'critical':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedZone } = useZoneStore();
  const { toast } = useToast();

  // Fetch complaints from Supabase
  useEffect(() => {
    async function fetchComplaints() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        // Apply zone filter from global store or region filter
        const zoneToFilter = regionFilter !== 'all' ? regionFilter : selectedZone;
        if (zoneToFilter && zoneToFilter !== 'all') {
          query = query.eq('zone', zoneToFilter);
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
          const statusMap: Record<string, string> = {
            open: 'Open',
            'in-progress': 'In Progress',
            resolved: 'Resolved',
            escalated: 'Escalated',
          };
          query = query.eq('status', statusMap[statusFilter] || statusFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase error:', error);
          toast({
            title: '⚠️ Database Error',
            description: 'Could not fetch complaints. Check your Supabase configuration.',
            variant: 'destructive',
          });
          setComplaints([]);
        } else if (data && data.length > 0) {
          // Map database fields to component format
          const mappedComplaints = data.map((c: any) => ({
            id: c.complaint_number || c.id,
            created_at: c.created_at,
            category: c.category,
            title: c.title || `${c.category} Issue - ${c.location?.split(',')[0] || 'Unknown'}`,
            description: c.description,
            location: c.location,
            latitude: c.latitude,
            longitude: c.longitude,
            status: (c.status || 'Open').toLowerCase().replace(' ', '-') as any,
            priority: c.priority || 'medium',
            citizen_name: c.citizen_name || 'Anonymous',
            citizen_phone: c.citizen_phone || c.caller_phone,
            zone: c.zone,
            ward: c.ward,
            assigned_to: c.assigned_to,
            resolved_at: c.resolved_at,
            ai_summary: c.ai_summary || c.description,
            sentiment: c.sentiment,
            source: c.source,
            _rawId: c.id, // Keep original UUID for call lookup
          }));
          setComplaints(mappedComplaints);
          // Auto-select first complaint
          if (mappedComplaints.length > 0 && !selectedComplaint) {
            handleSelectComplaint(mappedComplaints[0]);
          }
        } else {
          setComplaints([]);
          setSelectedComplaint(null);
        }
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComplaints();
  }, [selectedZone, statusFilter, categoryFilter, regionFilter]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('complaints-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'complaints' },
        (payload) => {
          const c = payload.new as any;
          const newComplaint: ComplaintWithCall = {
            id: c.complaint_number || c.id,
            created_at: c.created_at,
            category: c.category,
            title: c.title || `${c.category} Issue - ${c.location?.split(',')[0] || 'Unknown'}`,
            description: c.description,
            location: c.location,
            latitude: c.latitude,
            longitude: c.longitude,
            status: (c.status || 'Open').toLowerCase().replace(' ', '-') as any,
            priority: c.priority || 'medium',
            citizen_name: c.citizen_name || 'Anonymous',
            citizen_phone: c.citizen_phone || c.caller_phone,
            zone: c.zone,
            ward: c.ward,
            ai_summary: c.ai_summary || c.description,
            sentiment: c.sentiment,
            source: c.source,
            _rawId: c.id,
          };
          setComplaints((prev) => [newComplaint, ...prev]);
          toast({
            title: '🔔 New Complaint',
            description: `${newComplaint.category} - ${newComplaint.location}`,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'complaints' },
        (payload) => {
          const c = payload.new as any;
          setComplaints((prev) =>
            prev.map((complaint) =>
              complaint._rawId === c.id
                ? {
                    ...complaint,
                    status: (c.status || 'Open').toLowerCase().replace(' ', '-'),
                    assigned_to: c.assigned_to,
                    resolved_at: c.resolved_at,
                  }
                : complaint
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Fetch call details when selecting a complaint
  const handleSelectComplaint = async (complaint: ComplaintWithCall) => {
    setSelectedComplaint(complaint);
    setIsLoadingDetails(true);

    try {
      // Look up call data linked to this complaint
      const { data: callData, error } = await supabase
        .from('calls')
        .select('*')
        .eq('complaint_id', complaint._rawId)
        .single();

      if (!error && callData) {
        setSelectedComplaint({
          ...complaint,
          call_duration: callData.duration_seconds,
          call_transcript: callData.transcript,
          call_summary: callData.summary,
          recording_url: callData.recording_url,
        });
      }
    } catch (err) {
      // No call data found - that's fine for non-voice complaints
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filter complaints by search
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAssign = async () => {
    if (!selectedComplaint) return;

    try {
      await supabase
        .from('complaints')
        .update({
          status: 'In Progress',
          assigned_to: 'Junior Engineer',
          assigned_at: new Date().toISOString(),
        })
        .eq('id', selectedComplaint._rawId);

      setSelectedComplaint({ ...selectedComplaint, status: 'in-progress', assigned_to: 'Junior Engineer' });

      toast({
        title: '✅ Assigned Successfully',
        description: 'Complaint assigned to Junior Engineer',
      });
    } catch (err) {
      toast({
        title: '❌ Assignment Failed',
        description: 'Could not assign complaint',
        variant: 'destructive',
      });
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;

    try {
      await supabase
        .from('complaints')
        .update({
          status: 'Resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', selectedComplaint._rawId);

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id ? { ...c, status: 'resolved' as const } : c
        )
      );
      setSelectedComplaint({ ...selectedComplaint, status: 'resolved' });

      toast({
        title: '✅ Marked as Resolved',
        description: 'Complaint status updated successfully',
      });
    } catch (err) {
      toast({
        title: '❌ Update Failed',
        description: 'Could not update complaint status',
        variant: 'destructive',
      });
    }
  };

  const handleWhatsApp = () => {
    if (selectedComplaint?.citizen_phone) {
      const message = encodeURIComponent(
        `Dear Citizen, your complaint ${selectedComplaint.id} regarding ${selectedComplaint.category} has been received. Current status: ${selectedComplaint.status}. Thank you for using Sampark MCD.`
      );
      window.open(`https://wa.me/${selectedComplaint.citizen_phone}?text=${message}`, '_blank');
    }
    toast({
      title: '📱 WhatsApp Update Sent',
      description: 'Citizen notified via WhatsApp',
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setRegionFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    statusFilter !== 'all' || categoryFilter !== 'all' || regionFilter !== 'all' || searchQuery !== '';

  const CategoryIcon = selectedComplaint
    ? categoryIcons[selectedComplaint.category]?.icon || FileText
    : FileText;

  // Stats for current filter
  const openCount = complaints.filter((c) => c.status === 'open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complaints Inbox</h1>
          <p className="text-slate-500 mt-1">Manage and respond to citizen complaints</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Stats */}
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg">
            <span className="text-amber-700 text-sm font-medium">{openCount} Open</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
            <span className="text-blue-700 text-sm font-medium">{inProgressCount} In Progress</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg">
            <span className="text-emerald-700 text-sm font-medium">{resolvedCount} Resolved</span>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 rounded-xl">
        <Filter className="w-4 h-4 text-slate-400" />

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">🟡 Open</SelectItem>
            <SelectItem value="in-progress">🔵 In Progress</SelectItem>
            <SelectItem value="resolved">🟢 Resolved</SelectItem>
            <SelectItem value="escalated">🔴 Escalated</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Region Filter */}
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[170px] bg-white">
            <SelectValue placeholder="Region/Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {ZONES.map((zone) => (
              <SelectItem key={zone} value={zone}>
                {zone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <Input
          placeholder="Search ID, location, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs bg-white"
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}

        <div className="ml-auto text-sm text-slate-500 font-medium">
          {filteredComplaints.length} complaints
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - List */}
        <Card className="w-[420px] flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Ticket List</span>
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p>No complaints found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => {
                const catIcon = categoryIcons[complaint.category] || {
                  icon: FileText,
                  color: 'text-slate-600',
                  bg: 'bg-slate-50',
                };
                const Icon = catIcon.icon;

                return (
                  <div
                    key={complaint.id}
                    onClick={() => handleSelectComplaint(complaint)}
                    className={`p-4 border-b cursor-pointer transition-all ${
                      selectedComplaint?.id === complaint.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${catIcon.bg}`}>
                        <Icon className={`w-4 h-4 ${catIcon.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-slate-400">{complaint.id}</span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status.replace('-', ' ')}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 mt-1 truncate">
                          {complaint.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">
                              {complaint.location?.split(',')[0]}
                            </span>
                          </div>
                          {complaint.zone && (
                            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {complaint.zone?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-xs text-slate-400">{formatTime(complaint.created_at)}</p>
                          {complaint.source === 'voice' && (
                            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Headphones className="w-3 h-3" />
                              Voice
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Panel - Detail View */}
        {selectedComplaint ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Detail Header */}
            <CardHeader className="border-b bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      categoryIcons[selectedComplaint.category]?.bg || 'bg-slate-50'
                    }`}
                  >
                    <CategoryIcon
                      className={`w-6 h-6 ${
                        categoryIcons[selectedComplaint.category]?.color || 'text-slate-600'
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedComplaint.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-sm font-mono text-slate-400">
                        {selectedComplaint.id}
                      </span>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(
                          selectedComplaint.status
                        )}`}
                      >
                        {selectedComplaint.status.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(selectedComplaint.created_at)}
                      </span>
                      {selectedComplaint.source === 'voice' && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          Voice Call
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                    selectedComplaint.priority === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : selectedComplaint.priority === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : selectedComplaint.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedComplaint.priority}
                </span>
              </div>
            </CardHeader>

            {/* Detail Content */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-5">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <>
                  {/* Location & Citizen Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Location
                          </p>
                          <p className="text-sm text-slate-900 mt-1">{selectedComplaint.location}</p>
                          {selectedComplaint.zone && (
                            <p className="text-xs text-slate-500 mt-1">Zone: {selectedComplaint.zone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                        Citizen Information
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {selectedComplaint.citizen_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {selectedComplaint.citizen_phone || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call Details - Only shown for voice complaints */}
                  {selectedComplaint.source === 'voice' && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Headphones className="w-4 h-4 text-purple-600" />
                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                          Call Details
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-2xl font-bold text-purple-700">
                            {formatDuration(selectedComplaint.call_duration)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Call Duration</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-2xl font-bold text-purple-700">
                            {selectedComplaint.call_transcript
                              ? Math.ceil(selectedComplaint.call_transcript.split(' ').length / 150)
                              : 0}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Min Read</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-2xl font-bold text-purple-700">
                            {selectedComplaint.sentiment || 'Neutral'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Sentiment</p>
                        </div>
                      </div>

                      {/* Audio Player */}
                      {selectedComplaint.recording_url && (
                        <div className="flex items-center gap-4 p-3 bg-white rounded-lg mb-4">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                              <div className="h-full w-0 bg-purple-600 rounded-full transition-all"></div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-slate-500">
                              <span>0:00</span>
                              <span>{formatDuration(selectedComplaint.call_duration)}</span>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors">
                            <Volume2 className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      )}

                      {/* Transcript */}
                      {selectedComplaint.call_transcript && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                              Call Transcript
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {selectedComplaint.call_transcript}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Summary */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {selectedComplaint.source === 'voice' ? 'AI Issue Summary' : 'Description'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedComplaint.call_summary ||
                        selectedComplaint.ai_summary ||
                        selectedComplaint.description}
                    </p>
                    {selectedComplaint.sentiment && (
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-xs text-slate-500">Sentiment:</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            selectedComplaint.sentiment === 'Angry'
                              ? 'bg-red-100 text-red-700'
                              : selectedComplaint.sentiment === 'Frustrated'
                              ? 'bg-orange-100 text-orange-700'
                              : selectedComplaint.sentiment === 'Neutral'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {selectedComplaint.sentiment}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Map Preview */}
                  {selectedComplaint.latitude && selectedComplaint.longitude && (
                    <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center relative overflow-hidden">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                          selectedComplaint.longitude - 0.01
                        },${selectedComplaint.latitude - 0.01},${
                          selectedComplaint.longitude + 0.01
                        },${selectedComplaint.latitude + 0.01}&layer=mapnik&marker=${
                          selectedComplaint.latitude
                        },${selectedComplaint.longitude}`}
                        style={{ border: 0 }}
                      />
                    </div>
                  )}

                  {/* Assignment Info */}
                  {selectedComplaint.assigned_to && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                          Assigned To
                        </p>
                      </div>
                      <p className="text-sm text-slate-700">{selectedComplaint.assigned_to}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            {/* Action Bar */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center gap-3">
                <Button onClick={handleAssign} disabled={selectedComplaint.status === 'resolved'}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign to JE
                </Button>
                <Button
                  variant="success"
                  onClick={handleResolve}
                  disabled={selectedComplaint.status === 'resolved'}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button
                  variant="outline"
                  className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Update
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Select a complaint to view details</p>
              <p className="text-sm mt-1">Click on any complaint from the list</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
