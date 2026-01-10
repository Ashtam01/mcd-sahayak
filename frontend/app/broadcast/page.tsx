'use client';

import { useState } from 'react';
import {
  Megaphone,
  Send,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Trash2,
  Edit,
  Copy,
  MessageSquare,
  Phone,
  Mail,
  Bell,
  Globe,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ZONES } from '@/lib/store';

// Mock broadcast history
const broadcastHistory = [
  {
    id: 1,
    title: 'Water Supply Disruption - Rohini',
    message: 'Due to maintenance work, water supply will be affected in Rohini Sectors 3-7 from 10 AM to 4 PM tomorrow.',
    channel: 'sms',
    zone: 'North West Delhi',
    sentAt: '2026-01-09 09:30 AM',
    recipients: 45230,
    delivered: 44890,
    status: 'completed',
  },
  {
    id: 2,
    title: 'Garbage Collection Schedule Change',
    message: 'Garbage collection timings have been revised for South Delhi. New timing: 6 AM - 9 AM daily.',
    channel: 'whatsapp',
    zone: 'South Delhi',
    sentAt: '2026-01-08 02:15 PM',
    recipients: 89450,
    delivered: 87234,
    status: 'completed',
  },
  {
    id: 3,
    title: 'Road Construction Alert',
    message: 'Road widening work on Ring Road near ITO. Please use alternative routes from Jan 10-20.',
    channel: 'all',
    zone: 'Central Delhi',
    sentAt: '2026-01-08 11:00 AM',
    recipients: 156780,
    delivered: 152345,
    status: 'completed',
  },
  {
    id: 4,
    title: 'Property Tax Deadline Reminder',
    message: 'Last date for property tax payment is Jan 31, 2026. Pay online to avoid late fees.',
    channel: 'sms',
    zone: 'All Zones',
    sentAt: '2026-01-07 04:00 PM',
    recipients: 234560,
    delivered: 0,
    status: 'scheduled',
  },
  {
    id: 5,
    title: 'New Complaint Portal Launch',
    message: 'Sampark AI-powered complaint portal is now live! Register complaints via voice call or WhatsApp.',
    channel: 'all',
    zone: 'All Zones',
    sentAt: '2026-01-05 10:00 AM',
    recipients: 567890,
    delivered: 554321,
    status: 'completed',
  },
];

const templates = [
  { id: 1, name: 'Water Supply Alert', category: 'Utilities' },
  { id: 2, name: 'Road Closure Notice', category: 'Traffic' },
  { id: 3, name: 'Garbage Collection Update', category: 'Sanitation' },
  { id: 4, name: 'Tax Payment Reminder', category: 'Finance' },
  { id: 5, name: 'Festival Arrangements', category: 'Events' },
  { id: 6, name: 'Emergency Alert', category: 'Emergency' },
];

export default function BroadcastPage() {
  const [showComposer, setShowComposer] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <Phone className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const filteredBroadcasts = broadcastHistory.filter((broadcast) => {
    const matchesSearch =
      broadcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broadcast.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || broadcast.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Broadcast Center</h1>
          <p className="text-slate-500 mt-1">
            Send announcements and alerts to citizens across Delhi
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowComposer(!showComposer)}>
          <Plus className="w-4 h-4" />
          New Broadcast
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Sent</p>
                <p className="text-2xl font-bold text-slate-900">1.2M</p>
                <p className="text-xs text-slate-400 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Delivery Rate</p>
                <p className="text-2xl font-bold text-slate-900">97.8%</p>
                <p className="text-xs text-green-500 mt-1">+2.3% vs last month</p>
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
                <p className="text-sm text-slate-500">Active Subscribers</p>
                <p className="text-2xl font-bold text-slate-900">847K</p>
                <p className="text-xs text-slate-400 mt-1">Across all channels</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Scheduled</p>
                <p className="text-2xl font-bold text-slate-900">5</p>
                <p className="text-xs text-slate-400 mt-1">Pending broadcasts</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Composer Panel */}
      {showComposer && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Compose New Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Message */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Broadcast Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title..."
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message Body</Label>
                  <textarea
                    id="message"
                    className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message here..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                  />
                  <p className="text-xs text-slate-400">
                    {messageBody.length}/500 characters
                  </p>
                </div>

                {/* Quick Templates */}
                <div className="space-y-2">
                  <Label>Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {templates.slice(0, 4).map((template) => (
                      <button
                        key={template.id}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Broadcast Channel</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'all', label: 'All Channels', icon: Globe },
                      { value: 'sms', label: 'SMS', icon: Phone },
                      { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                      { value: 'push', label: 'Push Notification', icon: Bell },
                    ].map((channel) => (
                      <button
                        key={channel.value}
                        onClick={() => setSelectedChannel(channel.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          selectedChannel === channel.value
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <channel.icon className="w-4 h-4" />
                        <span className="text-sm">{channel.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger>
                      <Target className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Send Now
                    </Button>
                    <Button variant="outline" className="flex-1 justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>

                {/* Estimated Reach */}
                <div className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Estimated Reach</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">~234,560</p>
                  <p className="text-xs text-slate-400">citizens in selected zone</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setShowComposer(false)}>
                Cancel
              </Button>
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                Send Broadcast
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search broadcasts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Broadcast History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Broadcast History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBroadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        {getChannelIcon(broadcast.channel)}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{broadcast.title}</h3>
                        <p className="text-sm text-slate-500">{broadcast.zone}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                      {broadcast.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(broadcast.status)}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{broadcast.sentAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span>{broadcast.recipients.toLocaleString()} recipients</span>
                    </div>
                    {broadcast.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{broadcast.delivered.toLocaleString()} delivered</span>
                        <span className="text-slate-400">
                          ({((broadcast.delivered / broadcast.recipients) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { channel: 'SMS', icon: Phone, sent: 456000, delivered: 98.2, color: 'blue' },
                { channel: 'WhatsApp', icon: MessageSquare, sent: 389000, delivered: 99.1, color: 'green' },
                { channel: 'Push Notification', icon: Bell, sent: 234000, delivered: 94.5, color: 'purple' },
                { channel: 'Email', icon: Mail, sent: 121000, delivered: 89.3, color: 'orange' },
              ].map((item) => (
                <div key={item.channel} className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{item.channel}</span>
                      <span className="text-sm text-slate-500">{item.delivered}% delivery</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color}-500 rounded-full`}
                        style={{ width: `${item.delivered}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {(item.sent / 1000).toFixed(0)}K messages sent
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{template.name}</p>
                      <p className="text-xs text-slate-500">{template.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-500">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Create New Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
