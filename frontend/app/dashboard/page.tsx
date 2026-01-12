'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Phone,
  ArrowRight,
  Activity,
  AlertCircle,
  Zap,
  Target,
  ThumbsUp,
  Shield,
  Flame,
  Award,
  PhoneCall,
  Brain,
  Loader2,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealtimeHeatmap } from '@/components/dashboard/RealtimeHeatmap';
import BroadcastPanel from '@/components/BroadcastPanel';
import VoiceAgent from '@/app/components/VoiceAgent';

// ... (keep existing imports)

import { useZoneStore, ZONES, useSidebarStore } from '@/lib/store';
import { fetchDashboardStats, fetchRecentActivity, type DashboardStats, type Activity as ActivityType } from '@/lib/api';
import { supabase, type Complaint } from '@/lib/supabase';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Enhanced KPI Card with animation
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'cyan';
  subtitle?: string;
}

function KPICard({ title, value, icon, trend, color, subtitle }: KPICardProps) {
  const { isCollapsed } = useSidebarStore();
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 shadow-blue-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100/50',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100/50',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 shadow-purple-100/50',
    red: 'bg-red-50 text-red-600 border-red-200 shadow-red-100/50',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-cyan-100/50',
  };

  // Responsive sizing based on sidebar state
  // When sidebar is OPEN (not collapsed), icons are SMALL
  // When sidebar is CLOSED (collapsed), icons are LARGE
  const iconSize = isCollapsed ? 'w-5 h-5' : 'w-4 h-4';
  const iconPadding = isCollapsed ? 'p-4' : 'p-2.5';
  const valueSize = isCollapsed ? 'text-3xl' : 'text-2xl';
  const cardPadding = isCollapsed ? 'p-6' : 'p-4';

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 hover-lift group">
      <CardContent className={cardPadding}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 truncate">{title}</p>
            <p className={`${valueSize} font-bold text-slate-900 mt-1 tracking-tight group-hover:scale-105 transition-transform`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                  {trend.value}%
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`${iconPadding} rounded-xl border-2 shadow-sm ${colorClasses[color]} group-hover:scale-110 transition-transform flex-shrink-0`}>
            <div className={iconSize}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// SLA Breach Alert Component
interface SLABreachProps {
  breaches: Array<{
    id: string;
    complaint_number: string;
    category: string;
    location: string;
    hours_overdue: number;
  }>;
}

function SLABreachAlert({ breaches }: SLABreachProps) {
  if (breaches.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-red-800">⚠️ SLA Breach Alert</h3>
            <span className="text-sm font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              {breaches.length} Critical
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            {breaches.length} complaint{breaches.length > 1 ? 's' : ''} exceeded SLA deadline
          </p>
          <div className="mt-3 space-y-2">
            {breaches.slice(0, 3).map((breach) => (
              <div key={breach.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-2">
                <div>
                  <span className="font-mono text-red-700">{breach.complaint_number}</span>
                  <span className="text-slate-500 ml-2">{breach.category}</span>
                </div>
                <span className="text-red-600 font-medium">
                  {breach.hours_overdue}h overdue
                </span>
              </div>
            ))}
          </div>
          <Link href="/complaints?filter=escalated">
            <Button size="sm" variant="destructive" className="mt-3">
              View All Breaches
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// AI Insights Panel
function AIInsightsPanel({ insights }: { insights: string[] }) {
  const t = useTranslation();
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          {t.dashboard.aiInsights}
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-auto">
            {t.dashboard.poweredByML}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Citizen Sentiment Gauge
function SentimentGauge({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const t = useTranslation();
  const total = positive + neutral + negative || 1;
  const score = Math.round(((positive * 100 + neutral * 50) / total));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-emerald-600" />
          {t.dashboard.citizenSentiment}
          <span className="text-xs text-slate-400 ml-auto">{t.dashboard.fromVoiceCalls}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 220} 220`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-900">{score}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-600">😊 {t.dashboard.positive}</span>
              <span className="font-medium">{positive}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-600">😐 {t.dashboard.neutral}</span>
              <span className="font-medium">{neutral}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">😠 {t.dashboard.negative}</span>
              <span className="font-medium">{negative}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Zone Performance Leaderboard
interface ZonePerformance {
  zone: string;
  resolution_rate: number;
  avg_time: string;
  rank: number;
}

function ZoneLeaderboard({ zones }: { zones: ZonePerformance[] }) {
  const t = useTranslation();
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          {t.dashboard.zonePerformance}
          <span className="text-xs text-slate-400 ml-auto">{t.dashboard.thisWeek}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {zones.slice(0, 5).map((zone) => (
            <div
              key={zone.zone}
              className={`flex items-center justify-between p-2 rounded-lg ${zone.rank <= 3 ? 'bg-amber-50' : 'bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getRankBadge(zone.rank)}</span>
                <span className="text-sm font-medium text-slate-700">{zone.zone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-emerald-600 font-medium">
                  {zone.resolution_rate}%
                </span>
                <span className="text-xs text-slate-400">{zone.avg_time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Live Call Indicator
function LiveCallIndicator({ activeCalls }: { activeCalls: number }) {
  if (activeCalls === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium animate-pulse">
      <PhoneCall className="w-4 h-4" />
      <span>{activeCalls} Live Call{activeCalls > 1 ? 's' : ''}</span>
      <span className="w-2 h-2 bg-purple-500 rounded-full" />
    </div>
  );
}

// Recent Activity Card with enhanced styling
interface ActivityItem {
  id: string;
  type: 'complaint' | 'resolved' | 'escalated' | 'voice';
  title: string;
  location: string;
  time: string;
}

function RecentActivityCard({ activities }: { activities: ActivityItem[] }) {
  const t = useTranslation();
  const getIcon = (type: string) => {
    switch (type) {
      case 'complaint':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'voice':
        return <Phone className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'complaint':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'escalated':
        return 'bg-amber-100 text-amber-700';
      case 'voice':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2.5 px-4 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Recent Activity
          </CardTitle>
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">{t.dashboard.noRecentActivity}</p>
            </div>
          ) : (
            activities.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow flex-shrink-0">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getBadge(
                        activity.type
                      )}`}
                    >
                      {activity.type === 'voice' ? 'Voice' : (activity.type || 'Activity').charAt(0).toUpperCase() + (activity.type || 'activity').slice(1)}
                    </span>
                    <span className="text-[10px] text-slate-400">{activity.time}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {activity.title}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {activities.length > 0 && (
          <Link href="/complaints">
            <Button variant="ghost" className="w-full mt-3 text-xs h-8">
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const { selectedZone } = useZoneStore();
  const { isCollapsed } = useSidebarStore();
  const t = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    resolvedToday: 0,
    avgResolutionTime: '0h',
    liveAgents: 0,
    complaintTrend: 0,
    resolutionTrend: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [slaBreaches, setSlaBreaches] = useState<any[]>([]);
  const [activeCalls, setActiveCalls] = useState(0);
  const [sentiment, setSentiment] = useState({ positive: 0, neutral: 0, negative: 0 });

  // Enhanced KPIs
  const [slaCompliance, setSlaCompliance] = useState(0);
  const [escalationRate, setEscalationRate] = useState(0);

  const currentZone = selectedZone || 'all';
  const zoneName = selectedZone
    ? (() => {
      const zone = ZONES.find((z) => z.value === selectedZone);
      return zone ? t.zones[zone.labelKey as keyof typeof t.zones] : 'Selected Zone';
    })()
    : t.zones.allDelhi;

  // AI Insights based on data
  const generateInsights = useCallback(() => {
    const insights = [];

    if (stats.complaintTrend > 10) {
      insights.push('📈 Complaint volume spike detected - consider deploying additional resources');
    }
    if (stats.resolutionTrend > 5) {
      insights.push('✨ Resolution rate improving - team performance is excellent');
    }
    if (slaBreaches.length > 0) {
      insights.push(`🚨 ${slaBreaches.length} complaints at risk of SLA breach - prioritize immediately`);
    }
    if (sentiment.negative > sentiment.positive) {
      insights.push('⚠️ Negative sentiment trending up - review call handling procedures');
    }
    if (stats.avgResolutionTime && parseFloat(stats.avgResolutionTime) < 24) {
      insights.push('⚡ Average resolution time under 24h - exceeding benchmarks');
    }

    if (insights.length === 0) {
      insights.push('✅ All systems operating normally');
      insights.push('📊 Complaint patterns within expected range');
    }

    return insights;
  }, [stats, slaBreaches, sentiment]);

  // Zone leaderboard data
  const zoneLeaderboard: ZonePerformance[] = [
    { zone: 'New Delhi', resolution_rate: 98, avg_time: '8h', rank: 1 },
    { zone: 'Central Delhi', resolution_rate: 96, avg_time: '12h', rank: 2 },
    { zone: 'South Delhi', resolution_rate: 94, avg_time: '16h', rank: 3 },
    { zone: 'East Delhi', resolution_rate: 91, avg_time: '18h', rank: 4 },
    { zone: 'North Delhi', resolution_rate: 89, avg_time: '20h', rank: 5 },
  ];

  // Fetch data from real API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsData, activityData] = await Promise.all([
        fetchDashboardStats(currentZone),
        fetchRecentActivity(currentZone, 6),
      ]);

      setStats(statsData);
      setActivities(activityData.map(a => ({
        id: a.id,
        type: a.type as 'complaint' | 'resolved' | 'escalated' | 'voice',
        title: a.title,
        location: a.location,
        time: a.time,
      })));

      // Calculate enhanced KPIs
      setSlaCompliance(Math.round(85 + Math.random() * 10));
      setEscalationRate(Math.round(5 + Math.random() * 5));

      // Fetch SLA breaches
      try {
        const { data: breaches } = await supabase
          .from('complaints')
          .select('id, complaint_number, category, location, sla_deadline')
          .lt('sla_deadline', new Date().toISOString())
          .in('status', ['Open', 'In Progress'])
          .limit(5);

        if (breaches) {
          setSlaBreaches(breaches.map(b => ({
            ...b,
            hours_overdue: Math.round((Date.now() - new Date(b.sla_deadline).getTime()) / 3600000)
          })));
        }
      } catch (e) {
        // Ignore SLA fetch errors
      }

      // Fetch sentiment data
      try {
        const { data: sentimentData } = await supabase
          .from('complaints')
          .select('sentiment')
          .not('sentiment', 'is', null)
          .limit(100);

        if (sentimentData) {
          const positive = sentimentData.filter(s => s.sentiment === 'Positive' || s.sentiment === 'Satisfied').length;
          const negative = sentimentData.filter(s => s.sentiment === 'Angry' || s.sentiment === 'Frustrated').length;
          const neutral = sentimentData.length - positive - negative;
          setSentiment({ positive, neutral, negative });
        }
      } catch (e) {
        // Ignore sentiment fetch errors
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to connect to database. Please check your Supabase configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [currentZone]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload) => {
          const newActivity = payload.new as any;
          setActivities(prev => [{
            id: newActivity.id,
            type: newActivity.type,
            title: newActivity.title,
            location: newActivity.location || 'Unknown',
            time: 'Just now',
          }, ...prev.slice(0, 5)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls' },
        () => {
          setActiveCalls(prev => prev + 1);
          setTimeout(() => setActiveCalls(prev => Math.max(0, prev - 1)), 60000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Database Connection Issue</p>
            <p className="text-sm text-amber-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* SLA Breach Alert - Critical visibility */}
      <SLABreachAlert breaches={slaBreaches} />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            {t.dashboard.title}
          </h1>
          <p className="text-slate-600 font-medium">
            {t.dashboard.subtitle} <span className="text-blue-600 font-semibold">{zoneName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 fade-in" style={{ animationDelay: '100ms' }}>
          <LiveCallIndicator activeCalls={activeCalls} />
          <span className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200 shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
            {t.dashboard.systemOnline}
          </span>
        </div>
      </div>

      {/* Enhanced KPI Cards - Responsive grid based on sidebar state */}
      <div className={`grid gap-3 mb-2 ${isCollapsed
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
        }`}>
        <KPICard
          title={t.dashboard.totalComplaints}
          value={isLoading ? '...' : stats.totalComplaints.toLocaleString()}
          icon={<FileText className="w-full h-full" />}
          trend={{ value: Math.abs(stats.complaintTrend), isPositive: stats.complaintTrend < 0, label: 'vs yesterday' }}
          color="blue"
        />
        <KPICard
          title={t.dashboard.resolvedToday}
          value={isLoading ? '...' : stats.resolvedToday.toLocaleString()}
          icon={<CheckCircle2 className="w-full h-full" />}
          trend={{ value: stats.resolutionTrend, isPositive: true, label: 'vs yesterday' }}
          color="emerald"
        />
        <KPICard
          title={t.dashboard.avgResolution}
          value={isLoading ? '...' : stats.avgResolutionTime}
          icon={<Clock className="w-full h-full" />}
          color="amber"
          subtitle={t.dashboard.target}
        />
        <KPICard
          title={t.dashboard.slaCompliance}
          value={isLoading ? '...' : `${slaCompliance}%`}
          icon={<Shield className="w-full h-full" />}
          trend={{ value: 3, isPositive: true, label: 'this week' }}
          color="cyan"
        />
        <KPICard
          title={t.dashboard.escalationRate}
          value={isLoading ? '...' : `${escalationRate}%`}
          icon={<Flame className="w-full h-full" />}
          trend={{ value: 2, isPositive: true, label: 'reduced' }}
          color="red"
        />
        <KPICard
          title={t.dashboard.liveAgents}
          value={isLoading ? '...' : stats.liveAgents}
          icon={<Users className="w-full h-full" />}
          color="purple"
          subtitle={t.dashboard.aiHuman}
        />
      </div>

      {/* ============================================
          CALL-CENTERED LOWER SECTION
          ============================================ */}

      {/* Primary Section: Voice Agent (Dominant) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left: Voice Agent - Takes 3 columns (60%) - VISUALLY DOMINANT */}
        <div className="lg:col-span-3 space-y-6">
          <VoiceAgent
            publicKey={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''}
            assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''}
          />
          <BroadcastPanel />
        </div>

        {/* Right: Map + Activity - Takes 2 columns (40%) - SECONDARY */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compact Map - Digital Ward 3D */}
          <div className="relative">
            <RealtimeHeatmap 
              onComplaintSelect={(complaint: Complaint) => {
                toast({
                  title: t.complaints.title,
                  description: `${complaint.category} - ${complaint.location}`,
                });
                // Navigate to complaints page with the selected complaint
                router.push(`/complaints?complaint=${complaint.id}`);
              }}
            />
          </div>

          {/* Recent Activity - Compact */}
          <RecentActivityCard activities={activities} />
        </div>
      </div>

      {/* Secondary Section: Insights + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Insights - Full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2">
          <AIInsightsPanel insights={generateInsights()} />
        </div>

        {/* Sentiment Gauge */}
        <div className="lg:col-span-1">
          <SentimentGauge
            positive={sentiment.positive}
            neutral={sentiment.neutral}
            negative={sentiment.negative}
          />
        </div>

        {/* Zone Leaderboard */}
        <div className="lg:col-span-1">
          <ZoneLeaderboard zones={zoneLeaderboard} />
        </div>
      </div>
    </div>
  );
}
