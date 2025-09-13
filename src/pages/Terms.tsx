import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  ArrowLeft, 
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react';

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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
                  <FileText className="w-8 h-8" />
                  <span>Terms of Service</span>
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Please read these terms carefully before using our services
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
          {/* Important Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Important Notice</h3>
                  <p className="text-orange-700">
                    By using LINE Yield, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, please do not use our services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-6">
                  These Terms of Service ("Terms") govern your use of the LINE Yield platform ("Service") operated by LINE Yield Inc. 
                  ("Company", "we", "us", or "our"). By accessing or using our Service, you agree to be bound by these Terms.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
                <p className="text-gray-700 mb-4">
                  LINE Yield is a decentralized finance (DeFi) platform that provides:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Automated yield farming strategies for USDT</li>
                  <li>NFT rewards and gamification features</li>
                  <li>Referral programs and community incentives</li>
                  <li>Lending and borrowing services</li>
                  <li>Credit scoring and risk assessment</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Responsibilities</h2>
                <p className="text-gray-700 mb-4">As a user of our Service, you agree to:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your wallet and private keys</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use the Service for illegal or unauthorized purposes</li>
                  <li>Not attempt to circumvent security measures</li>
                  <li>Report any suspicious activity or security breaches</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Risk Disclosure</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Important Risk Warning
                  </h3>
                  <p className="text-red-700 mb-4">
                    DeFi protocols involve significant risks. You may lose some or all of your invested capital. 
                    Past performance does not guarantee future results.
                  </p>
                  <ul className="list-disc list-inside text-red-700 space-y-2">
                    <li>Smart contract risks and potential bugs</li>
                    <li>Market volatility and liquidity risks</li>
                    <li>Regulatory and legal risks</li>
                    <li>Technology and operational risks</li>
                    <li>Counterparty and credit risks</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Fees and Payments</h2>
                <p className="text-gray-700 mb-4">
                  Our Service may include various fees:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Performance fees on yield generated</li>
                  <li>Management fees for automated strategies</li>
                  <li>Transaction fees for blockchain operations</li>
                  <li>Withdrawal fees for certain operations</li>
                </ul>
                <p className="text-gray-700 mb-6">
                  All fees are clearly disclosed before transactions and may be subject to change with notice.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Intellectual Property</h2>
                <p className="text-gray-700 mb-6">
                  The Service and its original content, features, and functionality are owned by LINE Yield Inc. 
                  and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Privacy Policy</h2>
                <p className="text-gray-700 mb-6">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                  to understand our practices.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Prohibited Uses</h2>
                <p className="text-gray-700 mb-4">You may not use our Service:</p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
                <p className="text-gray-700 mb-6">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                  under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Disclaimer of Warranties</h2>
                <p className="text-gray-700 mb-6">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, 
                  whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, 
                  non-infringement or course of performance.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Limitation of Liability</h2>
                <p className="text-gray-700 mb-6">
                  In no event shall LINE Yield Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, 
                  be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                  loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Governing Law</h2>
                <p className="text-gray-700 mb-6">
                  These Terms shall be interpreted and governed by the laws of the Republic of Korea, without regard to its conflict of law provisions. 
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Changes to Terms</h2>
                <p className="text-gray-700 mb-6">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Contact Information</h2>
                <p className="text-gray-700 mb-6">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700">
                    <strong>LINE Yield Inc.</strong><br />
                    Email: legal@line-yield.com<br />
                    Address: Seoul, Republic of Korea<br />
                    Phone: +82-2-1234-5678
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-500 text-center">
                    By using LINE Yield, you acknowledge that you have read and understood these Terms of Service 
                    and agree to be bound by them.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
