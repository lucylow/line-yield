import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Daily Points Distribution API Endpoint
// This endpoint should be called by a cron job or scheduler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin authorization
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.KAIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // Contract configuration
    const contractAddress = process.env.LINE_YIELD_POINTS_CONTRACT_ADDRESS;
    const contractABI = [
      "function distributeDailyPoints()",
      "function getContractStats() view returns (uint256, uint256, uint256, uint256)",
      "function getLeaderboard() view returns (address[] memory, uint256[] memory)",
      "event DailyDistribution(uint256 totalDistributed, uint256 timestamp)"
    ];

    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Check if distribution is needed
    const [totalDistributed, dailyPool, lastDistributed, leaderboardSize] = await contract.getContractStats();
    
    const now = Math.floor(Date.now() / 1000);
    const timeSinceLastDistribution = now - lastDistributed.toNumber();
    const distributionInterval = 24 * 60 * 60; // 24 hours in seconds

    if (timeSinceLastDistribution < distributionInterval) {
      return res.status(200).json({
        success: true,
        message: 'Distribution not yet due',
        nextDistribution: lastDistributed.toNumber() + distributionInterval,
        timeRemaining: distributionInterval - timeSinceLastDistribution
      });
    }

    // Check if there are users eligible for distribution
    if (leaderboardSize.toNumber() === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users eligible for distribution',
        leaderboardSize: 0
      });
    }

    // Execute daily distribution
    console.log('Executing daily points distribution...');
    const tx = await contract.distributeDailyPoints();
    console.log(`Distribution transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

    // Get updated stats
    const [newTotalDistributed, newDailyPool, newLastDistributed, newLeaderboardSize] = await contract.getContractStats();
    const [leaderboardAddresses, leaderboardScores] = await contract.getLeaderboard();

    // Log distribution details
    const distributionDetails = {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      totalDistributed: ethers.utils.formatEther(newTotalDistributed),
      leaderboardSize: newLeaderboardSize.toNumber(),
      participants: leaderboardAddresses.map((address: string, index: number) => ({
        address,
        points: ethers.utils.formatEther(leaderboardScores[index])
      }))
    };

    console.log('Daily distribution completed:', distributionDetails);

    // Send notification (optional)
    await sendDistributionNotification(distributionDetails);

    res.status(200).json({
      success: true,
      message: 'Daily distribution completed successfully',
      data: distributionDetails
    });

  } catch (error: any) {
    console.error('Daily distribution failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Distribution failed',
      message: error.message || 'Internal server error'
    });
  }
}

// Send notification about distribution (optional)
async function sendDistributionNotification(distributionDetails: any) {
  try {
    // In a real implementation, you might send:
    // - Email notifications to admins
    // - Push notifications to users
    // - Discord/Slack webhook notifications
    // - Database logging
    
    console.log('Distribution notification sent:', {
      timestamp: new Date().toISOString(),
      ...distributionDetails
    });
    
    // Example webhook notification
    if (process.env.DISCORD_WEBHOOK_URL) {
      const webhookData = {
        content: `🎉 Daily Points Distribution Completed!`,
        embeds: [{
          title: 'LINE YIELD Points Distribution',
          description: `Successfully distributed points to ${distributionDetails.participants.length} users`,
          fields: [
            {
              name: 'Transaction Hash',
              value: distributionDetails.transactionHash,
              inline: true
            },
            {
              name: 'Block Number',
              value: distributionDetails.blockNumber.toString(),
              inline: true
            },
            {
              name: 'Gas Used',
              value: distributionDetails.gasUsed,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          color: 0x00ff00
        }]
      };

      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });
    }
  } catch (error) {
    console.error('Failed to send distribution notification:', error);
  }
}

