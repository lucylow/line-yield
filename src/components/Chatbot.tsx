import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello, I am LINE Yield AI Agent, simply ask me a question! Anything is welcomed',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const quickActions = [
    'What is LINE Yield?',
    'How do I get started?',
    'What are the rewards?',
    'Is it safe?',
    'How much can I earn?'
  ];
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! I\'m here to help you with LINE Yield. What would you like to know?';
    }
    
    // About LINE Yield
    if (message.includes('what is line yield') || message.includes('about line yield')) {
      return 'LINE Yield is a DeFi platform that allows you to earn yield on your Kaia-USDT tokens safely and easily. We offer gasless transactions powered by LINE and competitive APY rates.';
    }
    
    // How it works
    if (message.includes('how does it work') || message.includes('how to use')) {
      return 'Using LINE Yield is simple! 1) Connect your wallet, 2) Deposit your Kaia-USDT, 3) Earn yield automatically. We handle all the complex DeFi strategies for you.';
    }
    
    // APY questions
    if (message.includes('apy') || message.includes('yield') || message.includes('earn')) {
      return 'LINE Yield offers competitive APY rates that are automatically optimized across multiple DeFi protocols. Current rates vary but typically range from 8-15% APY.';
    }
    
    // Security questions
    if (message.includes('safe') || message.includes('security') || message.includes('risk')) {
      return 'LINE Yield prioritizes security with smart contract audits, multi-signature wallets, and insurance coverage. Your funds are protected by industry-leading security measures.';
    }
    
    // Gas fees
    if (message.includes('gas') || message.includes('fee') || message.includes('cost')) {
      return 'Great news! LINE Yield offers gasless transactions powered by LINE\'s relayer service. You can deposit, withdraw, and earn yield without paying gas fees.';
    }
    
    // Getting started
    if (message.includes('start') || message.includes('begin') || message.includes('get started')) {
      return 'To get started: 1) Click "Get Started Now" on the landing page, 2) Connect your wallet, 3) Deposit your Kaia-USDT tokens. It\'s that simple!';
    }
    
    // Rewards
    if (message.includes('reward') || message.includes('point') || message.includes('bonus')) {
      return 'LINE Yield offers a comprehensive rewards system! New users get 1,000 points as a welcome bonus, plus daily login rewards, transaction bonuses, and KAIA-specific rewards.';
    }
    
    // LINE integration
    if (message.includes('line') || message.includes('liff') || message.includes('mini app')) {
      return 'LINE Yield is fully integrated with LINE Mini Apps (LIFF). You can access it directly from LINE and enjoy features like ShareTargetPicker for inviting friends.';
    }
    
    // KAIA questions
    if (message.includes('kaia') || message.includes('klaytn')) {
      return 'LINE Yield is built on the KAIA network (formerly Klaytn). KAIA offers fast, low-cost transactions and is perfect for DeFi applications like LINE Yield.';
    }
    
    // DeFi questions
    if (message.includes('defi') || message.includes('decentralized')) {
      return 'DeFi (Decentralized Finance) allows you to earn interest on your crypto without traditional banks. LINE Yield makes DeFi simple and accessible for everyone.';
    }
    
    // Support
    if (message.includes('help') || message.includes('support') || message.includes('problem')) {
      return 'I\'m here to help! You can ask me about LINE Yield features, how to get started, rewards, security, or anything else. What specific question do you have?';
    }
    
    // Default responses
    const defaultResponses = [
      'That\'s an interesting question! LINE Yield is a DeFi platform for earning yield on Kaia-USDT. Would you like to know more about how it works?',
      'I\'d be happy to help! LINE Yield offers gasless transactions and competitive APY rates. What specific aspect would you like to learn about?',
      'Great question! LINE Yield makes DeFi accessible to everyone. You can earn yield without technical knowledge or gas fees. What would you like to know?',
      'LINE Yield is designed to be simple and secure. You can start earning yield in just a few clicks. Is there something specific you\'d like to understand better?',
      'I\'m the LINE Yield AI Agent! I can help you understand our platform, rewards system, security features, and how to get started. What would you like to know?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-80 md:h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-semibold text-sm md:text-base">LINE Yield AI Agent</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <Bot className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-xs md:text-sm">{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Quick Actions - Show only for the first message */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 text-center">Quick questions:</div>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full border border-blue-200 transition-colors duration-200"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about LINE Yield..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
                className="px-2 md:px-3"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
        )}
      </Button>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
      )}
    </div>
  );
};

export default Chatbot;
