import React, { useState } from 'react';
import { Settings, Bell, Eye, Globe, Shield, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  notifications: {
    transactionUpdates: boolean;
    yieldUpdates: boolean;
    securityAlerts: boolean;
  };
  privacy: {
    showBalance: boolean;
    shareAnalytics: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    currency: 'USD' | 'EUR' | 'KRW';
    language: 'en' | 'ko' | 'ja';
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    transactionUpdates: true,
    yieldUpdates: true,
    securityAlerts: true,
  },
  privacy: {
    showBalance: true,
    shareAnalytics: true,
  },
  display: {
    theme: 'auto',
    currency: 'USD',
    language: 'en',
  },
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setHasChanges(false);
    // In a real app, you might want to sync with a backend
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            </div>
            
            <div className="space-y-4 pl-8">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Transaction Updates</Label>
                  <p className="text-xs text-gray-500">Get notified about deposit and withdrawal confirmations</p>
                </div>
                <Switch
                  checked={settings.notifications.transactionUpdates}
                  onCheckedChange={(checked) => updateSettings('notifications', 'transactionUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Yield Updates</Label>
                  <p className="text-xs text-gray-500">Receive notifications when APY changes</p>
                </div>
                <Switch
                  checked={settings.notifications.yieldUpdates}
                  onCheckedChange={(checked) => updateSettings('notifications', 'yieldUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Security Alerts</Label>
                  <p className="text-xs text-gray-500">Important security notifications and alerts</p>
                </div>
                <Switch
                  checked={settings.notifications.securityAlerts}
                  onCheckedChange={(checked) => updateSettings('notifications', 'securityAlerts', checked)}
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Privacy</h3>
            </div>
            
            <div className="space-y-4 pl-8">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Balance</Label>
                  <p className="text-xs text-gray-500">Display your balance in the dashboard</p>
                </div>
                <Switch
                  checked={settings.privacy.showBalance}
                  onCheckedChange={(checked) => updateSettings('privacy', 'showBalance', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Share Analytics</Label>
                  <p className="text-xs text-gray-500">Help improve the app by sharing usage analytics</p>
                </div>
                <Switch
                  checked={settings.privacy.shareAnalytics}
                  onCheckedChange={(checked) => updateSettings('privacy', 'shareAnalytics', checked)}
                />
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Display</h3>
            </div>
            
            <div className="space-y-4 pl-8">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Theme</Label>
                <select
                  value={settings.display.theme}
                  onChange={(e) => updateSettings('display', 'theme', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Currency</Label>
                <select
                  value={settings.display.currency}
                  onChange={(e) => updateSettings('display', 'currency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="KRW">KRW (₩)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <select
                  value={settings.display.language}
                  onChange={(e) => updateSettings('display', 'language', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Advanced</h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                Clear Transaction History
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                Reset to Default Settings
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={hasChanges}
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="bg-green-500 hover:bg-green-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
