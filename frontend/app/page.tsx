'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  BarChart3,
  Activity,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  Users,
  Building2,
  Bell,
  Search,
  ChevronRight,
  FileText,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import VoiceAgent from './components/VoiceAgent';

// Mock Data
const CHART_DATA = [
  { name: 'Rohini', complaints: 45, resolved: 38 },
  { name: 'Dwarka', complaints: 32, resolved: 28 },
  { name: 'Karol Bagh', complaints: 28, resolved: 24 },
  { name: 'Civil Lines', complaints: 19, resolved: 17 },
  { name: 'South Delhi', complaints: 54, resolved: 42 },
  { name: 'Saket', complaints: 23, resolved: 21 },
];

const HOURLY_DATA = [
  { hour: '6AM', calls: 12 },
  { hour: '8AM', calls: 45 },
  { hour: '10AM', calls: 78 },
  { hour: '12PM', calls: 56 },
  { hour: '2PM', calls: 89 },
  { hour: '4PM', calls: 67 },
  { hour: '6PM', calls: 34 },
];

const RECENT_LOGS = [
  { id: 101, area: 'Ward 4, Rohini', issue: 'Garbage Pileup', status: 'Open', time: '2 mins ago', priority: 'high' },
  { id: 102, area: 'Sec-12, Dwarka', issue: 'Street Light Broken', status: 'Resolved', time: '15 mins ago', priority: 'medium' },
  { id: 103, area: 'Lajpat Nagar', issue: 'Water Logging', status: 'Critical', time: '1 hour ago', priority: 'critical' },
  { id: 104, area: 'Mayur Vihar', issue: 'Pothole on Main Rd', status: 'Open', time: '2 hours ago', priority: 'medium' },
  { id: 105, area: 'Nehru Place', issue: 'Drainage Overflow', status: 'Open', time: '3 hours ago', priority: 'high' },
];

const QUICK_ACTIONS = [
  { label: 'New Complaint', icon: FileText, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Broadcast Alert', icon: Megaphone, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { label: 'Deploy Team', icon: Users, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Emergency', icon: Zap, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vapiConfig, setVapiConfig] = useState({ publicKey: '', assistantId: '' });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch Vapi config from backend
    fetch('http://localhost:8000/api/config')
      .then(res => res.json())
      .then(data => {
        setVapiConfig({
          publicKey: data.vapi_public_key || '',
          assistantId: data.vapi_assistant_id || ''
        });
      })
      .catch(err => console.error('Failed to fetch config:', err));
    
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 glass-card border-x-0 border-t-0 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="emblem-container p-2.5 rounded-xl">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Sampark</h1>
              <p className="text-xs text-slate-400">Municipal Corporation of Delhi</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search complaints, areas..." 
              className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-500 w-64"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-200">Officer Dashboard</p>
                <p className="text-xs text-slate-500">Zone: North Delhi</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                ND
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
              <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
                Online
              </span>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <span className="text-slate-500">•</span>
              <span className="font-mono text-cyan-400">{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-red-400">Live Monitoring</span>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {QUICK_ACTIONS.map((action, idx) => (
            <button 
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-xl border ${action.color} hover:scale-[1.02] transition-transform cursor-pointer`}
            >
              <action.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{action.label}</span>
            </button>
          ))}
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<Phone className="w-6 h-6 text-blue-400" />}
            label="Total Calls Today"
            value="1,248"
            trend={+12}
            trendLabel="vs yesterday"
            glowClass="glow-blue"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
            label="Open Grievances"
            value="342"
            trend={-5}
            trendLabel="vs last week"
            glowClass="glow-amber"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
            label="Resolved (24h)"
            value="892"
            trend={+8}
            trendLabel="efficiency up"
            glowClass="glow-green"
          />
          <StatCard
            icon={<Building2 className="w-6 h-6 text-purple-400" />}
            label="Active Wards"
            value="12"
            sub="All zones operational"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left: Charts Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Complaints Chart */}
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-3">
                  <div className="p-2.5 bg-slate-800/80 rounded-xl">
                    <BarChart3 className="text-blue-400 w-5 h-5" />
                  </div>
                  Zone-wise Complaint Analysis
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500"></span>
                    Total
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    Resolved
                  </span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: '#1e293b', opacity: 0.3 }}
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px', 
                        color: '#f1f5f9',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <Bar dataKey="complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Call Volume Chart */}
            <div className="glass-card rounded-2xl p-6 hover-lift">
              <h3 className="text-lg font-semibold flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-800/80 rounded-xl">
                  <Activity className="text-cyan-400 w-5 h-5" />
                </div>
                Today&apos;s Call Volume
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <Area type="monotone" dataKey="calls" stroke="#06b6d4" strokeWidth={2} fill="url(#callGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: Live Feed */}
          <div className="glass-card rounded-2xl p-6 flex flex-col hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <div className="p-2.5 bg-slate-800/80 rounded-xl relative">
                  <Activity className="text-green-400 w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                Live Incoming Feed
              </h3>
              <span className="text-xs text-slate-500 font-mono">{RECENT_LOGS.length} active</span>
            </div>
            
            <div className="space-y-3 grow overflow-y-auto pr-1">
              {RECENT_LOGS.map((log) => (
                <div 
                  key={log.id} 
                  className="p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/30 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`}></span>
                      <span className="font-medium text-slate-200 group-hover:text-white transition-colors text-sm">{log.issue}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityStyle(log.priority)}`}>
                      {log.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin size={12} className="text-slate-500" />
                      {log.area}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-5 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 group">
              View All Activity
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Voice Agent */}
          <div className="xl:col-span-1">
            <VoiceAgent 
              publicKey={vapiConfig.publicKey}
              assistantId={vapiConfig.assistantId}
            />
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Municipal Corporation of Delhi • Sampark Command Center • Hack4 Delhi
          </p>
        </footer>
      </main>
    </div>
  );
}

// Helper Component: Stat Card
function StatCard({ icon, label, value, trend, trendLabel, sub, glowClass }: any) {
  const isPositive = trend > 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const trendBg = isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div className={`glass-card p-5 rounded-2xl hover-lift ${glowClass || ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-800/60 rounded-xl">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${trendBg} ${trendColor} text-xs font-semibold`}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h2>
      <p className="text-slate-400 text-sm">{label}</p>
      {(trendLabel || sub) && (
        <p className="text-xs text-slate-500 mt-2">
          {trendLabel || sub}
        </p>
      )}
    </div>
  );
}

// Helper Function for Status Colors
function getStatusColor(status: string) {
  switch(status) {
    case 'Open': return 'bg-amber-500';
    case 'Resolved': return 'bg-emerald-500';
    case 'Critical': return 'bg-red-500 animate-pulse';
    default: return 'bg-slate-500';
  }
}

// Helper Function for Priority Styles
function getPriorityStyle(priority: string) {
  switch(priority) {
    case 'critical': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'high': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'medium': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  }
}