'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useZoneStore, ZONES } from '@/lib/store';

// Mock data for charts
const weeklyData = [
  { day: 'Mon', complaints: 145, resolved: 132 },
  { day: 'Tue', complaints: 178, resolved: 156 },
  { day: 'Wed', complaints: 203, resolved: 189 },
  { day: 'Thu', complaints: 167, resolved: 154 },
  { day: 'Fri', complaints: 189, resolved: 172 },
  { day: 'Sat', complaints: 112, resolved: 98 },
  { day: 'Sun', complaints: 89, resolved: 82 },
];

const categoryData = [
  { category: 'Garbage Collection', count: 1234, percentage: 28, trend: 5.2 },
  { category: 'Water Supply', count: 987, percentage: 22, trend: -3.1 },
  { category: 'Street Lights', count: 756, percentage: 17, trend: 2.8 },
  { category: 'Road Repair', count: 654, percentage: 15, trend: 8.4 },
  { category: 'Drainage', count: 432, percentage: 10, trend: -1.5 },
  { category: 'Other', count: 356, percentage: 8, trend: 0.3 },
];

const zonePerformance = [
  { zone: 'North Delhi', resolved: 94, pending: 156, avgTime: '18h' },
  { zone: 'South Delhi', resolved: 87, pending: 203, avgTime: '24h' },
  { zone: 'East Delhi', resolved: 91, pending: 134, avgTime: '16h' },
  { zone: 'West Delhi', resolved: 89, pending: 178, avgTime: '20h' },
  { zone: 'Central Delhi', resolved: 96, pending: 89, avgTime: '12h' },
  { zone: 'New Delhi', resolved: 98, pending: 45, avgTime: '8h' },
];

const hourlyDistribution = [
  { hour: '6AM', count: 23 },
  { hour: '8AM', count: 67 },
  { hour: '10AM', count: 134 },
  { hour: '12PM', count: 156 },
  { hour: '2PM', count: 178 },
  { hour: '4PM', count: 145 },
  { hour: '6PM', count: 98 },
  { hour: '8PM', count: 56 },
  { hour: '10PM', count: 34 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { selectedZone } = useZoneStore();

  const maxComplaints = Math.max(...weeklyData.map((d) => d.complaints));
  const maxHourly = Math.max(...hourlyDistribution.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Complaints</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">4,419</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">12.5%</span>
                  <span className="text-sm text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Resolution Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">91.2%</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">3.2%</span>
                  <span className="text-sm text-slate-500">improvement</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Response Time</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">4.2h</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowDownRight className="w-4 h-4" />
                  <span className="text-sm font-medium">18%</span>
                  <span className="text-sm text-slate-500">faster</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Citizens</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">2,847</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">8.7%</span>
                  <span className="text-sm text-slate-500">new users</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Complaint Trends
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-500">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart */}
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1" style={{ height: '160px' }}>
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${(day.complaints / maxComplaints) * 100}%` }}
                        title={`Complaints: ${day.complaints}`}
                      />
                      <div
                        className="w-full bg-green-400 rounded-b transition-all"
                        style={{ height: `${(day.resolved / maxComplaints) * 100}%`, marginTop: '-4px' }}
                        title={`Resolved: ${day.resolved}`}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{day.day}</span>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-sm text-slate-600">New Complaints</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded" />
                  <span className="text-sm text-slate-600">Resolved</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-medium">{cat.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{cat.count.toLocaleString()}</span>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          cat.trend > 0 ? 'text-red-500' : 'text-green-500'
                        }`}
                      >
                        {cat.trend > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(cat.trend)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Zone Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Zone</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Resolution Rate</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Pending</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Avg Time</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {zonePerformance.map((zone) => (
                    <tr key={zone.zone} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{zone.zone}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                zone.resolved >= 95
                                  ? 'bg-green-500'
                                  : zone.resolved >= 90
                                  ? 'bg-blue-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${zone.resolved}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">{zone.resolved}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">{zone.pending}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{zone.avgTime}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            zone.resolved >= 95
                              ? 'bg-green-100 text-green-700'
                              : zone.resolved >= 90
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {zone.resolved >= 95 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Excellent
                            </>
                          ) : zone.resolved >= 90 ? (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              Good
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              Needs Attention
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hourlyDistribution.map((hour) => (
                <div key={hour.hour} className="flex items-center gap-3">
                  <span className="w-12 text-xs text-slate-500">{hour.hour}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${
                        hour.count > 150
                          ? 'bg-red-500'
                          : hour.count > 100
                          ? 'bg-orange-500'
                          : hour.count > 50
                          ? 'bg-blue-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${(hour.count / maxHourly) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-slate-600 text-right">{hour.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">Peak Time:</span> 2:00 PM - 4:00 PM
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Consider allocating more agents during peak hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
