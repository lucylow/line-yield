import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Award Points API Endpoint
// This endpoint handles awarding points for various actions
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
    const { action, userAddress, amount, referrerAddress, refereeAddress } = req.body;

    // Validate required fields
    if (!action || !userAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.KAIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

    // Contract configuration
    const contractAddress = process.env.LINE_YIELD_POINTS_CONTRACT_ADDRESS;
    const contractABI = [
      "function awardDepositPoints(address user, uint256 amount)",
      "function awardReferralPoints(address referrer, address referee)",
      "function getUserStats(address) view returns (uint256, uint256, uint256, uint256)",
      "event PointsAwarded(address indexed user, uint256 points, string reason, uint256 timestamp)"
    ];

    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    let tx;
    let pointsAwarded = '0';

    switch (action) {
      case 'deposit':
        if (!amount) {
          return res.status(400).json({ error: 'Amount required for deposit points' });
        }

        // Convert amount to wei (USDT has 6 decimals)
        const amountWei = ethers.utils.parseUnits(amount, 6);
        
        // Award deposit points (1 point per USDT)
        tx = await contract.awardDepositPoints(userAddress, amountWei);
        pointsAwarded = amount; // 1 point per USDT
        
        console.log(`Awarding deposit points: ${amount} USDT = ${pointsAwarded} points to ${userAddress}`);
        break;

      case 'referral':
        if (!referrerAddress || !refereeAddress) {
          return res.status(400).json({ error: 'Referrer and referee addresses required' });
        }

        // Award referral points (50 points each)
        tx = await contract.awardReferralPoints(referrerAddress, refereeAddress);
        pointsAwarded = '50'; // 50 points for referral
        
        console.log(`Awarding referral points: 50 points each to ${referrerAddress} and ${refereeAddress}`);
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    console.log(`Points award transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

    // Get updated user stats
    const [balance, totalEarned, referrals, referralPoints] = await contract.getUserStats(userAddress);

    const result = {
      success: true,
      action,
      userAddress,
      pointsAwarded,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      updatedStats: {
        balance: ethers.utils.formatEther(balance),
        totalEarned: ethers.utils.formatEther(totalEarned),
        referrals: referrals.toNumber(),
        referralPoints: ethers.utils.formatEther(referralPoints)
      }
    };

    // Log the award
    console.log('Points awarded successfully:', result);

    // Send notification (optional)
    await sendAwardNotification(result);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Points award failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Points award failed',
      message: error.message || 'Internal server error'
    });
  }
}

// Send notification about points award (optional)
async function sendAwardNotification(awardDetails: any) {
  try {
    console.log('Points award notification:', {
      timestamp: new Date().toISOString(),
      ...awardDetails
    });
    
    // Example webhook notification
    if (process.env.DISCORD_WEBHOOK_URL) {
      const webhookData = {
        content: `🎯 Points Awarded!`,
        embeds: [{
          title: 'LINE YIELD Points Award',
          description: `Successfully awarded ${awardDetails.pointsAwarded} points for ${awardDetails.action}`,
          fields: [
            {
              name: 'User',
              value: awardDetails.userAddress,
              inline: true
            },
            {
              name: 'Action',
              value: awardDetails.action,
              inline: true
            },
            {
              name: 'Points Awarded',
              value: awardDetails.pointsAwarded,
              inline: true
            },
            {
              name: 'Transaction Hash',
              value: awardDetails.transactionHash,
              inline: false
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
    console.error('Failed to send award notification:', error);
  }
}

