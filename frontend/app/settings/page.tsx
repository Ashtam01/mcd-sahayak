'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Mail,
  Phone,
  Key,
  Save,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Database,
  Server,
  Zap,
  Clock,
  Languages,
  Volume2,
  Smartphone,
  Monitor,
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
import { useToast } from '@/components/ui/use-toast';

// Settings sections
const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Monitor },
  { id: 'system', label: 'System', icon: Server },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: 'Admin Officer',
    email: 'admin@mcd.gov.in',
    phone: '+91 98765 43210',
    designation: 'Senior Administrative Officer',
    department: 'Grievance Redressal',
    employeeId: 'MCD-2024-1234',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    newComplaintAlert: true,
    escalationAlert: true,
    dailyDigest: true,
    weeklyReport: true,
    soundEnabled: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginAlerts: true,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    density: 'comfortable',
    animations: true,
  });

  // System settings
  const [system, setSystem] = useState({
    autoRefresh: true,
    refreshInterval: '30',
    dataRetention: '90',
    cacheEnabled: true,
  });

  const handleSave = () => {
    toast({
      title: '✅ Settings Saved',
      description: 'Your preferences have been updated successfully.',
      variant: 'success',
    });
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{profile.fullName}</h3>
          <p className="text-slate-500">{profile.designation}</p>
          <p className="text-sm text-slate-400">Employee ID: {profile.employeeId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              className="pl-10"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="phone"
              className="pl-10"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={profile.designation}
            onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={profile.department}
            onValueChange={(value) => setProfile({ ...profile, department: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Grievance Redressal">Grievance Redressal</SelectItem>
              <SelectItem value="Sanitation">Sanitation</SelectItem>
              <SelectItem value="Water Supply">Water Supply</SelectItem>
              <SelectItem value="Roads & Infrastructure">Roads & Infrastructure</SelectItem>
              <SelectItem value="Public Health">Public Health</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            value={profile.employeeId}
            disabled
            className="bg-slate-50"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Channels</h3>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, desc: 'Receive updates via email' },
            { key: 'smsNotifications', label: 'SMS Notifications', icon: Smartphone, desc: 'Receive SMS alerts' },
            { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, desc: 'Browser push notifications' },
            { key: 'soundEnabled', label: 'Sound Alerts', icon: Volume2, desc: 'Play sound for new alerts' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key as keyof typeof notifications],
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-blue-600'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Alert Types</h3>
        <div className="space-y-3">
          {[
            { key: 'newComplaintAlert', label: 'New Complaint Alerts', desc: 'Get notified for new complaints' },
            { key: 'escalationAlert', label: 'Escalation Alerts', desc: 'Alert when complaints are escalated' },
            { key: 'dailyDigest', label: 'Daily Digest', desc: 'Daily summary email at 9 AM' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly analytics report on Monday' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key as keyof typeof notifications],
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-blue-600'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                className="pl-10 pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                className="pl-10 pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Update Password
        </Button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
          Two-Factor Authentication
        </h3>
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                security.twoFactorEnabled ? 'bg-green-100' : 'bg-slate-200'
              }`}>
                <Shield className={`w-5 h-5 ${
                  security.twoFactorEnabled ? 'text-green-600' : 'text-slate-500'
                }`} />
              </div>
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">
                  {security.twoFactorEnabled
                    ? 'Your account is protected with 2FA'
                    : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <Button
              variant={security.twoFactorEnabled ? 'outline' : 'default'}
              size="sm"
              onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
            >
              {security.twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Session Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select
              value={security.sessionTimeout}
              onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}
            >
              <SelectTrigger>
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Login Alerts</p>
              <p className="text-sm text-slate-500">Email on new login</p>
            </div>
            <button
              onClick={() => setSecurity({ ...security, loginAlerts: !security.loginAlerts })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                security.loginAlerts ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  security.loginAlerts ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Active Sessions</h3>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">Current Session</p>
                  <p className="text-sm text-slate-500">Chrome on macOS • Delhi, India</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <Check className="w-4 h-4" />
                Active Now
              </span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900">Mobile App</p>
                  <p className="text-sm text-slate-500">iPhone 14 • Last active 2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                Revoke
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => setAppearance({ ...appearance, theme: theme.value })}
              className={`p-4 rounded-lg border-2 transition-all ${
                appearance.theme === theme.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <theme.icon className={`w-6 h-6 mx-auto mb-2 ${
                appearance.theme === theme.value ? 'text-blue-600' : 'text-slate-400'
              }`} />
              <p className={`text-sm font-medium ${
                appearance.theme === theme.value ? 'text-blue-600' : 'text-slate-600'
              }`}>
                {theme.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Language</h3>
        <Select
          value={appearance.language}
          onValueChange={(value) => setAppearance({ ...appearance, language: value })}
        >
          <SelectTrigger className="w-full md:w-64">
            <Languages className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
            <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
            <SelectItem value="ur">اردو (Urdu)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Display Density */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Display Density</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'spacious', label: 'Spacious' },
          ].map((density) => (
            <button
              key={density.value}
              onClick={() => setAppearance({ ...appearance, density: density.value })}
              className={`p-4 rounded-lg border-2 transition-all ${
                appearance.density === density.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1 mb-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`bg-slate-300 rounded ${
                      density.value === 'compact' ? 'h-1' : density.value === 'comfortable' ? 'h-1.5' : 'h-2'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-sm font-medium ${
                appearance.density === density.value ? 'text-blue-600' : 'text-slate-600'
              }`}>
                {density.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Animations */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-slate-600" />
            <div>
              <p className="font-medium text-slate-900">Animations</p>
              <p className="text-sm text-slate-500">Enable interface animations</p>
            </div>
          </div>
          <button
            onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              appearance.animations ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                appearance.animations ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      {/* Auto Refresh */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Data Refresh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Auto Refresh</p>
                <p className="text-sm text-slate-500">Automatically refresh dashboard data</p>
              </div>
              <button
                onClick={() => setSystem({ ...system, autoRefresh: !system.autoRefresh })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  system.autoRefresh ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    system.autoRefresh ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Refresh Interval</Label>
            <Select
              value={system.refreshInterval}
              onValueChange={(value) => setSystem({ ...system, refreshInterval: value })}
              disabled={!system.autoRefresh}
            >
              <SelectTrigger>
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Retention Period</Label>
            <Select
              value={system.dataRetention}
              onValueChange={(value) => setSystem({ ...system, dataRetention: value })}
            >
              <SelectTrigger>
                <Database className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Cache Enabled</p>
                <p className="text-sm text-slate-500">Cache data for faster loading</p>
              </div>
              <button
                onClick={() => setSystem({ ...system, cacheEnabled: !system.cacheEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  system.cacheEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    system.cacheEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">System Information</h3>
        <div className="p-4 bg-slate-50 rounded-lg space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Version</span>
            <span className="font-medium text-slate-900">v2.4.1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Last Updated</span>
            <span className="font-medium text-slate-900">Jan 8, 2026</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Server Status</span>
            <span className="flex items-center gap-1 font-medium text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Operational
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">API Endpoint</span>
            <span className="font-mono text-xs text-slate-600">api.sampark.mcd.gov.in</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-red-600 uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Clear All Cache</p>
              <p className="text-sm text-slate-500">Remove all cached data from your browser</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
              Clear Cache
            </Button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-red-200">
            <div>
              <p className="font-medium text-slate-900">Reset All Settings</p>
              <p className="text-sm text-slate-500">Restore all settings to default values</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
              Reset Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'security':
        return renderSecuritySection();
      case 'appearance':
        return renderAppearanceSection();
      case 'system':
        return renderSystemSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              {settingsSections.find((s) => s.id === activeSection)?.icon &&
                (() => {
                  const Icon = settingsSections.find((s) => s.id === activeSection)!.icon;
                  return <Icon className="w-5 h-5 text-blue-600" />;
                })()}
              {settingsSections.find((s) => s.id === activeSection)?.label} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
