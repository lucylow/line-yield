import React from 'react';
import { useLocalization } from '../hooks';

interface WelcomeBannerProps {
  className?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ className = '' }) => {
  const { strings, lang } = useLocalization();

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg ${className}`}>
      <h1 className="text-2xl font-bold mb-2">{strings.welcome}</h1>
      <p className="text-blue-100">
        {lang === 'ja' 
          ? 'LINE ミニアプリへようこそ！安全で簡単なDeFi体験をお楽しみください。'
          : 'Welcome to LINE Mini App! Enjoy a secure and easy DeFi experience.'
        }
      </p>
      <div className="mt-4 flex items-center space-x-2">
        <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
          {lang === 'ja' ? '日本語' : 'English'}
        </span>
        <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
          {strings.platformLiff}
        </span>
      </div>
    </div>
  );
};
