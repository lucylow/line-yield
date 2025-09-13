import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
  AlertTriangle, 
  Home, 
  ArrowLeft, 
  Search,
  RefreshCw
} from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-200 mb-4">404</div>
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <p className="text-gray-500">
            The page might have been moved, deleted, or you might have entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button
            onClick={handleGoHome}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Maybe you were looking for:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">Dashboard</div>
                <div className="text-sm text-gray-500">View your yield farming portfolio</div>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/loans')}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">Loans</div>
                <div className="text-sm text-gray-500">Access lending services</div>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/referral')}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">Referral Program</div>
                <div className="text-sm text-gray-500">Invite friends and earn rewards</div>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/nft')}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">NFT Rewards</div>
                <div className="text-sm text-gray-500">Collect unique NFT badges</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Search className="w-4 h-4" />
            <span>Try searching for what you need or</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/help')}
              className="p-0 h-auto"
            >
              visit our help center
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
