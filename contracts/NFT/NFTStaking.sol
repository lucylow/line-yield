// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./YieldNFT.sol";

/**
 * @title NFTStaking
 * @dev NFT staking contract with tier-based rewards and governance power
 * @author LINE Yield Team
 */
contract NFTStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Staking structure
    struct StakingInfo {
        address owner;
        uint256 tokenId;
        uint256 tierId;
        uint256 stakedAt;
        uint256 lastClaimTime;
        uint256 totalRewards;
        bool active;
    }

    // Tier-based reward rates (per day)
    struct TierRewardRate {
        uint256 baseRate; // Base USDT per day
        uint256 bonusRate; // Bonus rate for governance
        uint256 multiplier; // Multiplier for staking duration
    }

    // Governance voting power
    struct VotingPower {
        uint256 totalPower;
        uint256 stakingPower;
        uint256 tierPower;
        uint256 durationPower;
    }

    // State variables
    YieldNFT public nftContract;
    IERC20 public rewardToken; // USDT
    address public treasury;

    // Staking mappings
    mapping(uint256 => StakingInfo) public stakingInfo;
    mapping(address => uint256[]) public userStakedTokens;
    mapping(uint256 => TierRewardRate) public tierRewardRates;
    mapping(address => VotingPower) public votingPower;

    // Global staking stats
    uint256 public totalStakedNFTs;
    uint256 public totalRewardsDistributed;
    uint256 public totalVotingPower;

    // Reward distribution
    uint256 public rewardPerSecond;
    uint256 public lastRewardTime;
    uint256 public accRewardPerShare;

    // Events
    event NFTStaked(address indexed user, uint256 indexed tokenId, uint256 indexed tierId);
    event NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 indexed tokenId, uint256 amount);
    event TierRewardRateUpdated(uint256 indexed tierId, uint256 baseRate, uint256 bonusRate);
    event VotingPowerUpdated(address indexed user, uint256 totalPower);

    // Modifiers
    modifier onlyNFTOwner(uint256 _tokenId) {
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        _;
    }

    modifier tokenStaked(uint256 _tokenId) {
        require(stakingInfo[_tokenId].active, "Token not staked");
        _;
    }

    modifier tokenNotStaked(uint256 _tokenId) {
        require(!stakingInfo[_tokenId].active, "Token already staked");
        _;
    }

    constructor(
        address _nftContract,
        address _rewardToken,
        address _treasury
    ) {
        nftContract = YieldNFT(_nftContract);
        rewardToken = IERC20(_rewardToken);
        treasury = _treasury;
        lastRewardTime = block.timestamp;

        // Initialize tier reward rates
        _initializeTierRewardRates();
    }

    /**
     * @dev Initialize tier reward rates
     */
    function _initializeTierRewardRates() internal {
        // Tier 0: Common
        tierRewardRates[0] = TierRewardRate({
            baseRate: 1e6, // 1 USDT per day
            bonusRate: 0,
            multiplier: 100 // 1x multiplier
        });

        // Tier 1: Rare
        tierRewardRates[1] = TierRewardRate({
            baseRate: 2e6, // 2 USDT per day
            bonusRate: 5e5, // 0.5 USDT bonus
            multiplier: 120 // 1.2x multiplier
        });

        // Tier 2: Epic
        tierRewardRates[2] = TierRewardRate({
            baseRate: 5e6, // 5 USDT per day
            bonusRate: 1e6, // 1 USDT bonus
            multiplier: 150 // 1.5x multiplier
        });

        // Tier 3: Legendary
        tierRewardRates[3] = TierRewardRate({
            baseRate: 10e6, // 10 USDT per day
            bonusRate: 2e6, // 2 USDT bonus
            multiplier: 200 // 2x multiplier
        });

        // Tier 4: Mythic
        tierRewardRates[4] = TierRewardRate({
            baseRate: 20e6, // 20 USDT per day
            bonusRate: 5e6, // 5 USDT bonus
            multiplier: 300 // 3x multiplier
        });

        // Tier 5: Transcendent
        tierRewardRates[5] = TierRewardRate({
            baseRate: 50e6, // 50 USDT per day
            bonusRate: 10e6, // 10 USDT bonus
            multiplier: 500 // 5x multiplier
        });
    }

    /**
     * @dev Stake NFT
     */
    function stakeNFT(uint256 _tokenId) external onlyNFTOwner(_tokenId) tokenNotStaked(_tokenId) nonReentrant whenNotPaused {
        // Get NFT metadata
        (uint256 tierId, , , , , , ) = nftContract.tokenMetadata(_tokenId);
        
        // Transfer NFT to staking contract
        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);

        // Create staking info
        stakingInfo[_tokenId] = StakingInfo({
            owner: msg.sender,
            tokenId: _tokenId,
            tierId: tierId,
            stakedAt: block.timestamp,
            lastClaimTime: block.timestamp,
            totalRewards: 0,
            active: true
        });

        // Update user staked tokens
        userStakedTokens[msg.sender].push(_tokenId);

        // Update global stats
        totalStakedNFTs = totalStakedNFTs.add(1);

        // Update voting power
        _updateVotingPower(msg.sender);

        emit NFTStaked(msg.sender, _tokenId, tierId);
    }

    /**
     * @dev Unstake NFT
     */
    function unstakeNFT(uint256 _tokenId) external tokenStaked(_tokenId) nonReentrant {
        StakingInfo storage info = stakingInfo[_tokenId];
        require(info.owner == msg.sender, "Not staker");

        // Calculate and claim rewards
        uint256 rewards = _calculateRewards(_tokenId);
        if (rewards > 0) {
            _claimRewards(_tokenId);
        }

        // Transfer NFT back to owner
        nftContract.safeTransferFrom(address(this), msg.sender, _tokenId);

        // Update staking info
        info.active = false;

        // Remove from user staked tokens
        _removeStakedTokenFromUser(msg.sender, _tokenId);

        // Update global stats
        totalStakedNFTs = totalStakedNFTs.sub(1);

        // Update voting power
        _updateVotingPower(msg.sender);

        emit NFTUnstaked(msg.sender, _tokenId, rewards);
    }

    /**
     * @dev Claim rewards for staked NFT
     */
    function claimRewards(uint256 _tokenId) external tokenStaked(_tokenId) nonReentrant {
        StakingInfo storage info = stakingInfo[_tokenId];
        require(info.owner == msg.sender, "Not staker");

        uint256 rewards = _calculateRewards(_tokenId);
        require(rewards > 0, "No rewards to claim");

        _claimRewards(_tokenId);
    }

    /**
     * @dev Claim all rewards for user
     */
    function claimAllRewards() external nonReentrant {
        uint256[] memory stakedTokens = userStakedTokens[msg.sender];
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < stakedTokens.length; i++) {
            uint256 tokenId = stakedTokens[i];
            if (stakingInfo[tokenId].active) {
                uint256 rewards = _calculateRewards(tokenId);
                if (rewards > 0) {
                    totalRewards = totalRewards.add(rewards);
                    _claimRewards(tokenId);
                }
            }
        }

        require(totalRewards > 0, "No rewards to claim");
    }

    /**
     * @dev Calculate rewards for a staked NFT
     */
    function _calculateRewards(uint256 _tokenId) internal view returns (uint256) {
        StakingInfo storage info = stakingInfo[_tokenId];
        if (!info.active) return 0;

        TierRewardRate storage tierRate = tierRewardRates[info.tierId];
        uint256 stakingDuration = block.timestamp.sub(info.lastClaimTime);
        
        // Calculate base rewards
        uint256 baseRewards = tierRate.baseRate.mul(stakingDuration).div(1 days);
        
        // Calculate bonus rewards
        uint256 bonusRewards = tierRate.bonusRate.mul(stakingDuration).div(1 days);
        
        // Calculate duration multiplier
        uint256 totalStakingDuration = block.timestamp.sub(info.stakedAt);
        uint256 multiplierBonus = 0;
        
        if (totalStakingDuration >= 30 days) {
            multiplierBonus = baseRewards.mul(tierRate.multiplier.sub(100)).div(10000);
        }
        
        return baseRewards.add(bonusRewards).add(multiplierBonus);
    }

    /**
     * @dev Claim rewards for a specific NFT
     */
    function _claimRewards(uint256 _tokenId) internal {
        StakingInfo storage info = stakingInfo[_tokenId];
        uint256 rewards = _calculateRewards(_tokenId);
        
        if (rewards > 0) {
            // Transfer rewards
            rewardToken.safeTransfer(info.owner, rewards);
            
            // Update staking info
            info.lastClaimTime = block.timestamp;
            info.totalRewards = info.totalRewards.add(rewards);
            
            // Update global stats
            totalRewardsDistributed = totalRewardsDistributed.add(rewards);
            
            emit RewardsClaimed(info.owner, _tokenId, rewards);
        }
    }

    /**
     * @dev Update voting power for user
     */
    function _updateVotingPower(address _user) internal {
        uint256[] memory stakedTokens = userStakedTokens[_user];
        uint256 totalPower = 0;
        uint256 stakingPower = 0;
        uint256 tierPower = 0;
        uint256 durationPower = 0;

        for (uint256 i = 0; i < stakedTokens.length; i++) {
            uint256 tokenId = stakedTokens[i];
            if (stakingInfo[tokenId].active) {
                StakingInfo storage info = stakingInfo[tokenId];
                
                // Base staking power (1 point per NFT)
                stakingPower = stakingPower.add(1);
                
                // Tier-based power
                tierPower = tierPower.add(info.tierId.add(1));
                
                // Duration-based power
                uint256 stakingDuration = block.timestamp.sub(info.stakedAt);
                uint256 durationMultiplier = stakingDuration.div(7 days).add(1); // 1 point per week
                durationPower = durationPower.add(durationMultiplier);
            }
        }

        totalPower = stakingPower.add(tierPower).add(durationPower);

        votingPower[_user] = VotingPower({
            totalPower: totalPower,
            stakingPower: stakingPower,
            tierPower: tierPower,
            durationPower: durationPower
        });

        emit VotingPowerUpdated(_user, totalPower);
    }

    /**
     * @dev Get user's staked tokens
     */
    function getUserStakedTokens(address _user) external view returns (uint256[] memory) {
        return userStakedTokens[_user];
    }

    /**
     * @dev Get staking info for token
     */
    function getStakingInfo(uint256 _tokenId) external view returns (StakingInfo memory) {
        return stakingInfo[_tokenId];
    }

    /**
     * @dev Get pending rewards for token
     */
    function getPendingRewards(uint256 _tokenId) external view returns (uint256) {
        return _calculateRewards(_tokenId);
    }

    /**
     * @dev Get user's total pending rewards
     */
    function getUserPendingRewards(address _user) external view returns (uint256) {
        uint256[] memory stakedTokens = userStakedTokens[_user];
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < stakedTokens.length; i++) {
            uint256 tokenId = stakedTokens[i];
            if (stakingInfo[tokenId].active) {
                totalRewards = totalRewards.add(_calculateRewards(tokenId));
            }
        }

        return totalRewards;
    }

    /**
     * @dev Get user's voting power
     */
    function getUserVotingPower(address _user) external view returns (VotingPower memory) {
        return votingPower[_user];
    }

    /**
     * @dev Get tier reward rate
     */
    function getTierRewardRate(uint256 _tierId) external view returns (TierRewardRate memory) {
        return tierRewardRates[_tierId];
    }

    /**
     * @dev Update tier reward rate
     */
    function updateTierRewardRate(
        uint256 _tierId,
        uint256 _baseRate,
        uint256 _bonusRate,
        uint256 _multiplier
    ) external onlyOwner {
        tierRewardRates[_tierId] = TierRewardRate({
            baseRate: _baseRate,
            bonusRate: _bonusRate,
            multiplier: _multiplier
        });

        emit TierRewardRateUpdated(_tierId, _baseRate, _bonusRate);
    }

    /**
     * @dev Remove staked token from user's list
     */
    function _removeStakedTokenFromUser(address _user, uint256 _tokenId) internal {
        uint256[] storage tokens = userStakedTokens[_user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == _tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Set treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @dev Pause staking
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = rewardToken.balanceOf(address(this));
        if (balance > 0) {
            rewardToken.safeTransfer(owner(), balance);
        }
    }
}

