import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Clock, 
  RefreshCw, 
  Mail, 
  Twitter, 
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Bell
} from 'lucide-react';

interface MaintenanceInfo {
  isMaintenanceMode: boolean;
  estimatedDuration?: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  message?: string;
  features?: string[];
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  contactEmail?: string;
}

interface MaintenanceScreenProps {
  maintenanceInfo?: MaintenanceInfo;
  onRetry?: () => void;
  className?: string;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  maintenanceInfo = {
    isMaintenanceMode: true,
    estimatedDuration: '2-4 hours',
    message: 'We are currently performing scheduled maintenance to improve your experience.',
    features: [
      'Enhanced security protocols',
      'Improved transaction processing',
      'New yield optimization strategies',
      'Better user interface'
    ],
    socialLinks: {
      twitter: 'https://twitter.com/lineyield',
      discord: 'https://discord.gg/lineyield',
      telegram: 'https://t.me/lineyield'
    },
    contactEmail: 'support@lineyield.com'
  },
  onRetry,
  className = ''
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Simulate elapsed time since maintenance started
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Default retry behavior - reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubscribeUpdates = () => {
    // In a real implementation, this would open a subscription modal
    // or redirect to a newsletter signup page
    alert('Thank you for your interest! We\'ll notify you when maintenance is complete.');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Maintenance Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Under Maintenance
            </CardTitle>
            <p className="text-gray-600 text-lg leading-relaxed">
              {maintenanceInfo.message}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Scheduled Maintenance
              </Badge>
            </div>

            {/* Progress Section */}
            {maintenanceInfo.progress !== undefined && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{maintenanceInfo.progress}%</span>
                </div>
                <Progress value={maintenanceInfo.progress} className="h-2" />
              </div>
            )}

            {/* Time Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Elapsed Time</div>
                <div className="font-semibold text-gray-900">{formatTime(timeElapsed)}</div>
              </div>
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Estimated Duration</div>
                <div className="font-semibold text-gray-900">{maintenanceInfo.estimatedDuration}</div>
              </div>
              <div className="text-center">
                <Bell className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-semibold text-gray-900">In Progress</div>
              </div>
            </div>

            {/* Features Being Updated */}
            {maintenanceInfo.features && maintenanceInfo.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-center">What's Being Updated</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {maintenanceInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1 flex items-center justify-center gap-2"
                variant="default"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Check Again
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSubscribeUpdates}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Get Updates
              </Button>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-3">
                Need immediate assistance? Contact our support team
              </p>
              <div className="flex justify-center space-x-4">
                {maintenanceInfo.contactEmail && (
                  <a
                    href={`mailto:${maintenanceInfo.contactEmail}`}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Support</span>
                  </a>
                )}
                
                {maintenanceInfo.socialLinks?.twitter && (
                  <a
                    href={maintenanceInfo.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                {maintenanceInfo.socialLinks?.discord && (
                  <a
                    href={maintenanceInfo.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Discord</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-gray-900">Why Maintenance?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We regularly perform maintenance to ensure the highest level of security, 
                performance, and reliability for your DeFi investments. This scheduled 
                maintenance includes security updates, performance optimizations, and 
                new feature deployments.
              </p>
              <div className="flex justify-center space-x-6 text-xs text-gray-500">
                <span>🔒 Enhanced Security</span>
                <span>⚡ Better Performance</span>
                <span>🆕 New Features</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
