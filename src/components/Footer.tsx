import React from 'react';
import { LineChart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <LineChart className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">LINE Yield</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The easiest way to earn yield on your stablecoins through LINE Messenger and Kaia blockchain.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <span className="text-sm">X</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <span className="text-sm">DC</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <span className="text-sm">GH</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-background/20 transition-colors">
                <span className="text-sm">TG</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">How It Works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Pricing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-background transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-background/20 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2024 LINE Yield Protocol. All rights reserved. Built on Kaia Blockchain.
          </p>
        </div>
      </div>
    </footer>
  );
};