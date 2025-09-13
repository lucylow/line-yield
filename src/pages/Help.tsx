import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  HelpCircle, 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone,
  BookOpen,
  Video,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const Help: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const faqSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Connect Wallet" button on the homepage and follow the prompts to connect your Kaia-compatible wallet. No separate account creation is needed - your wallet address serves as your account.'
        },
        {
          question: 'What wallets are supported?',
          answer: 'We support all Kaia-compatible wallets including Kaia Wallet, MetaMask, and WalletConnect-compatible wallets. You can also use social login options.'
        },
        {
          question: 'How do I deposit USDT?',
          answer: 'Navigate to the Dashboard, click "Deposit USDT", enter the amount you want to deposit, and confirm the transaction. Your funds will be automatically allocated to the best yield strategies.'
        }
      ]
    },
    {
      id: 'yield-farming',
      title: 'Yield Farming',
      icon: '🌾',
      questions: [
        {
          question: 'How does yield farming work?',
          answer: 'Your USDT is automatically allocated across multiple DeFi protocols to maximize yield. Our smart contracts handle the complex strategies while you earn passive income.'
        },
        {
          question: 'What is the current APY?',
          answer: 'APY varies based on market conditions and strategy performance. Current average APY is around 8.64%, but this can change based on DeFi market conditions.'
        },
        {
          question: 'When do I receive my yield?',
          answer: 'Yield is automatically compounded daily. You can see your earnings in real-time on the dashboard, and they are added to your total balance.'
        },
        {
          question: 'Are there any fees?',
          answer: 'We offer gasless transactions for deposits and withdrawals. There are no hidden fees - you only pay the standard blockchain gas fees for transactions.'
        }
      ]
    },
    {
      id: 'referral-program',
      title: 'Referral Program',
      icon: '🎯',
      questions: [
        {
          question: 'How does the referral program work?',
          answer: 'Share your unique referral link with friends. When they sign up and deposit USDT, both you and your friend earn bonus Yield Points and ongoing rewards.'
        },
        {
          question: 'What rewards do I get for referring?',
          answer: 'You earn 100 points when a friend signs up, 50 points when they make their first deposit, and 10% of their ongoing yield earnings.'
        },
        {
          question: 'Is there a limit to referrals?',
          answer: 'No, there is no limit to the number of people you can refer. The more friends you bring to LINE Yield, the more you can earn.'
        }
      ]
    },
    {
      id: 'nft-rewards',
      title: 'NFT Rewards',
      icon: '🎨',
      questions: [
        {
          question: 'What are NFT rewards?',
          answer: 'NFT rewards are unique digital badges you can earn based on your Yield Points. They represent your achievements and can be collected, displayed, and traded.'
        },
        {
          question: 'How do I earn NFT rewards?',
          answer: 'Earn Yield Points through deposits, referrals, and yield farming. When you reach certain point thresholds, you can mint NFT badges for that tier.'
        },
        {
          question: 'Can I trade my NFTs?',
          answer: 'Yes, NFTs are ERC-721 compliant and can be traded on any compatible marketplace or transferred to other users.'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: '🔒',
      questions: [
        {
          question: 'Is my money safe?',
          answer: 'Yes, all smart contracts are audited and use industry-standard security practices. Your funds are protected by over-collateralization and automated risk management.'
        },
        {
          question: 'What happens if there\'s a hack?',
          answer: 'We have comprehensive insurance coverage and emergency protocols. In the unlikely event of a security incident, affected users will be compensated.'
        },
        {
          question: 'How do I protect my account?',
          answer: 'Never share your private keys or seed phrases. Use hardware wallets for large amounts, enable 2FA when available, and always verify transaction details.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      questions: [
        {
          question: 'My transaction is stuck, what should I do?',
          answer: 'Check your wallet for pending transactions. If stuck, you may need to increase gas fees or wait for network congestion to clear. Contact support if the issue persists.'
        },
        {
          question: 'Why can\'t I withdraw my funds?',
          answer: 'Ensure you have sufficient balance and that the withdrawal amount doesn\'t exceed your available balance. Check if there are any pending transactions that might affect your balance.'
        },
        {
          question: 'The app is not loading properly',
          answer: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection and that your wallet is properly connected.'
        }
      ]
    }
  ];

  const filteredSections = faqSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.questions.some(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
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
                  <HelpCircle className="w-8 h-8" />
                  <span>Help & Support</span>
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Find answers to common questions and get support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Video Tutorials
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  API Reference
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* FAQ Sections */}
            {filteredSections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{section.icon}</span>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </div>
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
                </CardHeader>
                {expandedSections.has(section.id) && (
                  <CardContent className="space-y-4">
                    {section.questions.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Contact Support */}
            <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                <p className="mb-4 opacity-90">
                  Our support team is here to help you 24/7
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="secondary" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Start Live Chat</span>
                  </Button>
                  <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-semibold mb-2">How to Maximize Your Yield</h4>
                    <p className="text-sm text-gray-600">Learn the best strategies to optimize your yield farming returns</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-semibold mb-2">Understanding Gas Fees</h4>
                    <p className="text-sm text-gray-600">Everything you need to know about blockchain transaction fees</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-semibold mb-2">Wallet Security Best Practices</h4>
                    <p className="text-sm text-gray-600">Keep your funds safe with these security tips</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-semibold mb-2">Troubleshooting Common Issues</h4>
                    <p className="text-sm text-gray-600">Solutions to the most frequently encountered problems</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
