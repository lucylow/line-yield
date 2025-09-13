import React from 'react';
import { useLocalization, useT, useDateFormat, useNumberFormat, useCurrencyFormat, usePercentageFormat } from '../hooks/useLocalization';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Calendar, 
  DollarSign, 
  Percent, 
  Hash,
  MessageSquare,
  Wallet,
  TrendingUp
} from 'lucide-react';

export const LocalizationDemo: React.FC = () => {
  const { lang, strings } = useLocalization();
  const t = useT();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const formatCurrency = useCurrencyFormat();
  const formatPercentage = usePercentageFormat();

  const currentDate = new Date();
  const sampleNumber = 1234567.89;
  const sampleCurrency = 1000.50;
  const samplePercentage = 8.64;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t('miniDappTitle')}</h1>
        <p className="text-lg text-gray-600">{t('miniDappDescription')}</p>
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Language Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('language')}
          </CardTitle>
          <CardDescription>
            Current language: <Badge variant="outline">{lang.toUpperCase()}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Browser Language</h4>
              <p className="text-sm text-gray-600">
                {navigator.language || navigator.userLanguage || 'en'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Detected Language</h4>
              <p className="text-sm text-gray-600">
                {lang === 'ja' ? '日本語 (Japanese)' : 'English'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formatting Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('today')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Default Format</p>
              <p className="text-lg">{formatDate(currentDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Full Format</p>
              <p className="text-lg">{formatDate(currentDate, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Time Only</p>
              <p className="text-lg">{formatDate(currentDate, { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Number Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              {t('totalAssets')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Number: {sampleNumber}</p>
              <p className="text-lg">{formatNumber(sampleNumber)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Integer</p>
              <p className="text-lg">{formatNumber(sampleNumber, { 
                maximumFractionDigits: 0 
              })}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Compact</p>
              <p className="text-lg">{formatNumber(sampleNumber, { 
                notation: 'compact' 
              })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Currency Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t('balance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">USD: {sampleCurrency}</p>
              <p className="text-lg">{formatCurrency(sampleCurrency, 'USD')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">JPY: {sampleCurrency}</p>
              <p className="text-lg">{formatCurrency(sampleCurrency, 'JPY')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Compact</p>
              <p className="text-lg">{formatCurrency(sampleCurrency, 'USD', { 
                notation: 'compact' 
              })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Percentage Formatting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              {t('apy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">APY: {samplePercentage}%</p>
              <p className="text-lg">{formatPercentage(samplePercentage)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">High Precision</p>
              <p className="text-lg">{formatPercentage(samplePercentage, { 
                maximumFractionDigits: 4 
              })}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Compact</p>
              <p className="text-lg">{formatPercentage(samplePercentage, { 
                notation: 'compact' 
              })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UI Strings Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            UI Strings
          </CardTitle>
          <CardDescription>
            Examples of localized UI strings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">{t('wallet')}</h4>
              <div className="space-y-1 text-sm">
                <p><strong>{t('connectWallet')}:</strong> {t('connectWallet')}</p>
                <p><strong>{t('connected')}:</strong> {t('connected')}</p>
                <p><strong>{t('connecting')}:</strong> {t('connecting')}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">{t('actions')}</h4>
              <div className="space-y-1 text-sm">
                <p><strong>{t('deposit')}:</strong> {t('deposit')}</p>
                <p><strong>{t('withdraw')}:</strong> {t('withdraw')}</p>
                <p><strong>{t('claim')}:</strong> {t('claim')}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">{t('status')}</h4>
              <div className="space-y-1 text-sm">
                <p><strong>{t('statusPending')}:</strong> {t('statusPending')}</p>
                <p><strong>{t('statusConfirmed')}:</strong> {t('statusConfirmed')}</p>
                <p><strong>{t('statusFailed')}:</strong> {t('statusFailed')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('actions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">{t('connectWallet')}</Button>
            <Button variant="outline">{t('deposit')}</Button>
            <Button variant="outline">{t('withdraw')}</Button>
            <Button variant="outline">{t('claim')}</Button>
            <Button variant="ghost">{t('settings')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>{t('messages')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-green-800">{t('welcomeMessage')}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{t('connectWalletMessage')}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">{t('depositMessage')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalizationDemo;
