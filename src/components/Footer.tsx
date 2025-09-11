import React from 'react';
import { LineChart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-blue-900 text-white py-20">
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                <LineChart className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold">LINE Yield</span>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              The easiest way to earn yield on your stablecoins through LINE Messenger.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 hover:-translate-y-1 transition-all duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 hover:-translate-y-1 transition-all duration-300">
                <i className="fab fa-discord"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 hover:-translate-y-1 transition-all duration-300">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 hover:-translate-y-1 transition-all duration-300">
                <i className="fab fa-telegram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-5">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-5">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-5">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            &copy; 2023 LINE Yield Protocol. All rights reserved. Built on Kaia Blockchain.
          </p>
        </div>
      </div>
    </footer>
  );
};