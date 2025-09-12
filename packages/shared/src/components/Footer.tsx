import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LY</span>
              </div>
              <span className="text-lg font-bold text-gray-900">LINE Yield</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Maximize your stablecoin yields across multiple DeFi protocols with our intelligent yield aggregation platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Vaults</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Strategies</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Analytics</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Docs</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Contact</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Security</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2024 LINE Yield. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
