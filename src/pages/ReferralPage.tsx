import React from 'react';
import { ReferralSystem } from '@/components/ReferralSystem';
import { CopyInviteLink } from '@/components/CopyInviteLink';

export const ReferralPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Referral Program
          </h1>
          <p className="text-gray-600">
            Invite friends and earn rewards together on LINE Yield
          </p>
        </div>

        {/* Full Referral System */}
        <ReferralSystem className="mb-8" />

        {/* Simple Copy Invite Link Component */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Share</h2>
          <p className="text-gray-600 mb-4">
            Copy your invite link or share directly with friends
          </p>
          <CopyInviteLink />
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
