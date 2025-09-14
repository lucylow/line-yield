import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageSwitcher, LanguageSettings } from '@shared/components/LanguageSwitcher';
import { useTranslation, useNumberFormatting, useDateTimeFormatting } from '@shared/hooks/useTranslation';
import { TranslatedTokenManagementPanel } from '@/components/TranslatedTokenManagementPanel';
import { 
  Globe, 
  Languages, 
  Settings, 
  Coins,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Gift,
  Lock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export const MultilingualDemoPage: React.FC = () => {
  const { t, currentLanguage, isEnglish, isJapanese } = useTranslation();
  const { formatNumber, formatCurrency, formatPercentage } = useNumberFormatting();
  const { formatDate, formatRelativeTime } = useDateTimeFormatting();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for demonstration
  const sampleData = {
    tokenBalance: 1250.75,
    totalRewards: 45.20,
    pendingRewards: 12.50,
    apy: 8.64,
    totalStaked: 50000,
    userStakes: 1000,
    referralCount: 5,
    lastTransaction: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    vestingProgress: 65.5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('landing.title')} - {t('settings.language')} Demo
            </h1>
            <LanguageSwitcher variant="dropdown" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('landing.description')} This demo showcases the multilingual capabilities with English and Japanese support.
          </p>
        </div>

        {/* Language Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-blue-900">
                  {t('settings.language')}: {currentLanguage === 'en' ? 'English' : '日本語'}
                </div>
                <div className="text-sm text-blue-700">
                  {isEnglish && "Currently viewing in English. Switch to Japanese to see translations."}
                  {isJapanese && "現在日本語で表示中です。英語に切り替えて翻訳を確認してください。"}
                </div>
              </div>
              <LanguageSwitcher variant="buttons" />
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('tokens.overview')}
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              {t('tokens.tokenManagement')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('settings.language')}
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {t('landing.features')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">{t('tokens.lytBalance')}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(sampleData.tokenBalance)} LYT
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">{t('tokens.totalRewards')}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(sampleData.totalRewards)} LYT
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">{t('yield.apy')}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercentage(sampleData.apy / 100)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">{t('line.totalReferrals')}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(sampleData.referralCount)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Translation Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  {t('settings.language')} Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Common UI Elements</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loading:</span>
                        <span className="font-medium">{t('common.loading')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success:</span>
                        <span className="font-medium">{t('common.success')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cancel:</span>
                        <span className="font-medium">{t('common.cancel')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirm:</span>
                        <span className="font-medium">{t('common.confirm')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Token Management</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stake Tokens:</span>
                        <span className="font-medium">{t('tokens.stakeTokens')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Claim Rewards:</span>
                        <span className="font-medium">{t('tokens.claimRewards')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vesting Progress:</span>
                        <span className="font-medium">{t('tokens.vestingProgress')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Rewards:</span>
                        <span className="font-medium">{t('tokens.pendingRewards')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formatting Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Number & Date Formatting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Numbers</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token Balance:</span>
                        <span className="font-medium">{formatNumber(sampleData.tokenBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">{formatCurrency(1250.75, 'USD')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Percentage:</span>
                        <span className="font-medium">{formatPercentage(sampleData.apy / 100)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Dates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Transaction:</span>
                        <span className="font-medium">{formatDate(sampleData.lastTransaction)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Relative Time:</span>
                        <span className="font-medium">{formatRelativeTime(sampleData.lastTransaction)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{t('tokens.active')}</Badge>
                        <Badge variant="secondary">{t('tokens.inactive')}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{t('tokens.unlocked')}</Badge>
                        <Badge variant="destructive">{t('tokens.locked')}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Token Management Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <TranslatedTokenManagementPanel />
          </TabsContent>

          {/* Language Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t('settings.language')} {t('settings.preferences')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LanguageSettings />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Language Switcher Variants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Dropdown Style</h4>
                  <LanguageSwitcher variant="dropdown" />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Button Style</h4>
                  <LanguageSwitcher variant="buttons" />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Compact Style</h4>
                  <LanguageSwitcher variant="compact" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    {t('settings.language')} Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Default English language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Japanese as secondary language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Automatic fallback to English</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Language persistence in localStorage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Browser language detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Number and date formatting</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Technical Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">React Context for state management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Type-safe translation keys</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Custom hooks for easy usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Multiple UI component variants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">RTL language support ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Easy extensibility for new languages</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Implementation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    This multilingual system uses a structured approach with English as the default language 
                    and Japanese as the secondary language. All non-English translations are wrapped in 
                    <code className="bg-gray-100 px-1 rounded">[translate:...]</code> markup for easy identification.
                  </p>
                  <p>
                    The system automatically detects browser language preferences and falls back to English 
                    if a translation is missing. Language preferences are persisted in localStorage for 
                    consistent user experience across sessions.
                  </p>
                  <p>
                    Number and date formatting automatically adapts to the selected language locale, 
                    providing proper formatting for currencies, percentages, and dates according to 
                    regional conventions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MultilingualDemoPage;



