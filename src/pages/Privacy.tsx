import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Shield, 
  ArrowLeft, 
  Calendar,
  Eye,
  Lock,
  Database,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                  <Shield className="w-8 h-8" />
                  <span>Privacy Policy</span>
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  How we collect, use, and protect your personal information
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: January 15, 2024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Eye className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Privacy Matters</h3>
                  <p className="text-blue-700">
                    We are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, and safeguard your data when you use LINE Yield.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Database className="w-6 h-6 mr-2" />
                  1. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                <p className="text-gray-700 mb-4">We may collect the following types of personal information:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li><strong>Wallet Information:</strong> Public wallet addresses and transaction history</li>
                  <li><strong>Contact Information:</strong> Email addresses for notifications and support</li>
                  <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                  <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Automatically Collected Information</h3>
                <p className="text-gray-700 mb-4">We automatically collect certain information when you use our Service:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Log data including IP addresses, browser type, and access times</li>
                  <li>Usage patterns and preferences</li>
                  <li>Error reports and performance data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserCheck className="w-6 h-6 mr-2" />
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li><strong>Service Provision:</strong> To provide and maintain our DeFi services</li>
                  <li><strong>Account Management:</strong> To manage your account and provide customer support</li>
                  <li><strong>Security:</strong> To protect against fraud, abuse, and security threats</li>
                  <li><strong>Communication:</strong> To send important updates and notifications</li>
                  <li><strong>Analytics:</strong> To improve our services and user experience</li>
                  <li><strong>Compliance:</strong> To comply with legal and regulatory requirements</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-2" />
                  3. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:</p>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Service Providers</h3>
                <p className="text-gray-700 mb-4">We may share information with trusted third-party service providers who assist us in:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Blockchain infrastructure and smart contract execution</li>
                  <li>Data analytics and performance monitoring</li>
                  <li>Customer support and communication</li>
                  <li>Security and fraud prevention</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Legal Requirements</h3>
                <p className="text-gray-700 mb-6">
                  We may disclose your information if required by law or if we believe such action is necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Protect the rights, property, or safety of our users</li>
                  <li>Investigate or prevent fraud or security issues</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Measures
                  </h3>
                  <p className="text-green-700 mb-4">
                    We implement industry-standard security measures to protect your information:
                  </p>
                  <ul className="list-disc list-inside text-green-700 space-y-2">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Secure data centers with physical and digital security</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Access controls and authentication protocols</li>
                    <li>Monitoring and incident response procedures</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Retention</h2>
                <p className="text-gray-700 mb-6">
                  We retain your personal information only as long as necessary to provide our services and comply with legal obligations. 
                  Transaction data may be retained longer for regulatory compliance and audit purposes.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to certain processing of your information</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Cookies and Tracking</h2>
                <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our services</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  You can control cookie settings through your browser preferences, but disabling cookies may affect functionality.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Third-Party Services</h2>
                <p className="text-gray-700 mb-6">
                  Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices 
                  of these third parties. We encourage you to review their privacy policies before providing any personal information.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. International Data Transfers</h2>
                <p className="text-gray-700 mb-6">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Children's Privacy</h2>
                <p className="text-gray-700 mb-6">
                  Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information 
                  from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 mb-6">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                  on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Contact Us</h2>
                <p className="text-gray-700 mb-6">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700">
                    <strong>Privacy Officer</strong><br />
                    LINE Yield Inc.<br />
                    Email: privacy@line-yield.com<br />
                    Address: Seoul, Republic of Korea<br />
                    Phone: +82-2-1234-5678
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-8">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>
                      By using LINE Yield, you acknowledge that you have read and understood this Privacy Policy 
                      and agree to the collection and use of your information as described herein.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
