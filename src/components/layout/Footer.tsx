import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  Mail, 
  MessageCircle,
  ExternalLink,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Yield Farming', href: '/dashboard' },
        { name: 'Lending', href: '/loans' },
        { name: 'NFT Rewards', href: '/nft' },
        { name: 'Referral Program', href: '/referral' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/help', external: true },
        { name: 'API Reference', href: '/help', external: true },
        { name: 'Smart Contracts', href: '/help', external: true },
        { name: 'Security Audit', href: '/help', external: true },
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Discord', href: 'https://discord.gg/line-yield', external: true },
        { name: 'Telegram', href: 'https://t.me/line_yield', external: true },
        { name: 'Twitter', href: 'https://twitter.com/line_yield', external: true },
        { name: 'GitHub', href: 'https://github.com/line-yield', external: true },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/help' },
        { name: 'Bug Reports', href: '/help' },
        { name: 'Feature Requests', href: '/help' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/line_yield', icon: Twitter },
    { name: 'GitHub', href: 'https://github.com/line-yield', icon: Github },
    { name: 'Discord', href: 'https://discord.gg/line-yield', icon: MessageCircle },
    { name: 'Email', href: 'mailto:support@line-yield.com', icon: Mail },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LY</span>
              </div>
              <h3 className="text-xl font-bold">LINE Yield</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The future of DeFi lending and yield farming. Earn automated yield on your USDT 
              while you chat, with NFT rewards and referral programs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} LINE Yield Inc. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/help"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for the DeFi community</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            <strong>Risk Warning:</strong> DeFi protocols involve significant risks. You may lose some or all of your invested capital. 
            Past performance does not guarantee future results. Please invest responsibly and only with funds you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

