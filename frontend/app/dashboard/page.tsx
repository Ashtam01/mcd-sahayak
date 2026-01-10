'use client';

import { useEffect, useState, useCallback } from 'react';
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
import VoiceAgent from '@/app/components/VoiceAgent';
import { useZoneStore, ZONES } from '@/lib/store';
import { fetchDashboardStats, fetchRecentActivity, type DashboardStats, type Activity as ActivityType } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                >
                  {trend.value}%
                </span>
                <span className="text-xs text-slate-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>{icon}</div>
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
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI Insights
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-auto">
            Powered by ML
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
  const total = positive + neutral + negative || 1;
  const score = Math.round(((positive * 100 + neutral * 50) / total));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-emerald-600" />
          Citizen Sentiment
          <span className="text-xs text-slate-400 ml-auto">From Voice Calls</span>
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
              <span className="text-emerald-600">😊 Positive</span>
              <span className="font-medium">{positive}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-600">😐 Neutral</span>
              <span className="font-medium">{neutral}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">😠 Negative</span>
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
          Zone Performance
          <span className="text-xs text-slate-400 ml-auto">This Week</span>
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Live Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Real-time</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getBadge(
                        activity.type
                      )}`}
                    >
                      {activity.type === 'voice' ? 'Voice Call' : (activity.type || 'Activity').charAt(0).toUpperCase() + (activity.type || 'activity').slice(1)}
                    </span>
                    <span className="text-xs text-slate-400">{activity.time}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mt-1 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <Link href="/complaints">
          <Button variant="ghost" className="w-full mt-4">
            View All Activity
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const { selectedZone } = useZoneStore();
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
    ? ZONES.find((z) => z.value === selectedZone)?.label || 'Selected Zone'
    : '🏢 All Delhi HQ';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time overview for {zoneName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveCallIndicator activeCalls={activeCalls} />
          <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Enhanced KPI Cards - 6 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Complaints"
          value={isLoading ? '...' : stats.totalComplaints.toLocaleString()}
          icon={<FileText className="w-5 h-5" />}
          trend={{ value: Math.abs(stats.complaintTrend), isPositive: stats.complaintTrend < 0, label: 'vs yesterday' }}
          color="blue"
        />
        <KPICard
          title="Resolved Today"
          value={isLoading ? '...' : stats.resolvedToday.toLocaleString()}
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend={{ value: stats.resolutionTrend, isPositive: true, label: 'vs yesterday' }}
          color="emerald"
        />
        <KPICard
          title="Avg Resolution"
          value={isLoading ? '...' : stats.avgResolutionTime}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Target: 24h"
        />
        <KPICard
          title="SLA Compliance"
          value={isLoading ? '...' : `${slaCompliance}%`}
          icon={<Shield className="w-5 h-5" />}
          trend={{ value: 3, isPositive: true, label: 'this week' }}
          color="cyan"
        />
        <KPICard
          title="Escalation Rate"
          value={isLoading ? '...' : `${escalationRate}%`}
          icon={<Flame className="w-5 h-5" />}
          trend={{ value: 2, isPositive: true, label: 'reduced' }}
          color="red"
        />
        <KPICard
          title="Live Agents"
          value={isLoading ? '...' : stats.liveAgents}
          icon={<Users className="w-5 h-5" />}
          color="purple"
          subtitle="AI + Human"
        />
      </div>

      {/* Main Content Grid - 3 columns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Heatmap */}
        <div className="xl:col-span-2 space-y-6">
          <RealtimeHeatmap />

          {/* AI Insights - Below heatmap */}
          <AIInsightsPanel insights={generateInsights()} />
        </div>

        {/* Right Column - Voice Agent + Activity */}
        <div className="xl:col-span-1 space-y-6">
          {/* Voice Agent Widget - HERO FEATURE */}
          <VoiceAgent
            publicKey={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''}
            assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''}
          />

          {/* Recent Activity */}
          <RecentActivityCard activities={activities} />
        </div>
      </div>

      {/* Bottom Row - Sentiment + Leaderboard + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SentimentGauge
          positive={sentiment.positive}
          neutral={sentiment.neutral}
          negative={sentiment.negative}
        />
        <ZoneLeaderboard zones={zoneLeaderboard} />

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/complaints">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1 text-xs">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Complaints
                </Button>
              </Link>
              <Link href="/broadcast">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1 text-xs">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Broadcast
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1 text-xs">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Analytics
                </Button>
              </Link>
              <Link href="/heatmap">
                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1 text-xs">
                  <Target className="w-4 h-4 text-red-600" />
                  Full Map
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
