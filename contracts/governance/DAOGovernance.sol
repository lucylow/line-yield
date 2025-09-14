// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title DAO Governance Smart Contract for Kaia Wave Stablecoin DeFi
/// @notice Enables community governance for the LINE Yield protocol
/// @dev Supports token-weighted voting, proposal creation, and execution
contract DAOGovernance is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Proposal {
        uint256 id;
        address proposer;
        address target;
        bytes callData;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
        string title;
        string description;
        uint256 quorumRequired;
    }

    struct VoteInfo {
        bool hasVoted;
        bool support;
        uint256 votes;
    }

    // Governance token (e.g., LINE token or vault shares)
    IERC20 public immutable governanceToken;
    
    uint256 public proposalCount;
    uint256 public votingDelay; // Time before voting starts (seconds)
    uint256 public votingPeriod; // Duration of voting (seconds)
    uint256 public proposalThreshold; // Minimum tokens required to propose
    uint256 public quorumPercentage; // Percentage of total supply needed for quorum
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => VoteInfo)) public votes;
    mapping(address => uint256) public lastProposalBlock;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address target,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        bool support,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    
    modifier onlyGovernance() {
        require(msg.sender == address(this), "Only governance");
        _;
    }
    
    constructor(
        address _governanceToken,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage
    ) {
        require(_governanceToken != address(0), "Invalid token");
        require(_votingPeriod > 0, "Invalid voting period");
        require(_quorumPercentage <= 100, "Invalid quorum");
        
        governanceToken = IERC20(_governanceToken);
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        proposalThreshold = _proposalThreshold;
        quorumPercentage = _quorumPercentage;
    }
    
    /// @notice Create a new governance proposal
    function propose(
        address target,
        bytes calldata callData,
        string memory title,
        string memory description
    ) external returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient voting power"
        );
        require(
            block.timestamp >= lastProposalBlock[msg.sender] + votingDelay,
            "Proposal cooldown not met"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        uint256 startTime = block.timestamp + votingDelay;
        uint256 endTime = startTime + votingPeriod;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            target: target,
            callData: callData,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            canceled: false,
            title: title,
            description: description,
            quorumRequired: (governanceToken.totalSupply() * quorumPercentage) / 100
        });
        
        lastProposalBlock[msg.sender] = block.timestamp;
        
        emit ProposalCreated(proposalId, msg.sender, target, title, startTime, endTime);
        return proposalId;
    }
    
    /// @notice Cast a vote on a proposal
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.canceled, "Proposal canceled");
        require(!proposal.executed, "Proposal executed");
        require(!votes[proposalId][msg.sender].hasVoted, "Already voted");
        
        uint256 votingPower = governanceToken.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");
        
        votes[proposalId][msg.sender] = VoteInfo({
            hasVoted: true,
            support: support,
            votes: votingPower
        });
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(msg.sender, proposalId, support, votingPower);
    }
    
    /// @notice Execute a successful proposal
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes >= proposal.quorumRequired, "Quorum not met");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not approved");
        
        proposal.executed = true;
        
        // Execute the proposal
        (bool success, bytes memory returnData) = proposal.target.call(proposal.callData);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId);
    }
    
    /// @notice Cancel a proposal (only proposer)
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer, "Only proposer");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }
    
    /// @notice Get proposal state
    function getProposalState(uint256 proposalId) external view returns (string memory) {
        Proposal memory proposal = proposals[proposalId];
        
        if (proposal.canceled) return "Canceled";
        if (proposal.executed) return "Executed";
        if (block.timestamp < proposal.startTime) return "Pending";
        if (block.timestamp <= proposal.endTime) return "Active";
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        if (totalVotes < proposal.quorumRequired) return "Defeated";
        if (proposal.forVotes <= proposal.againstVotes) return "Defeated";
        
        return "Succeeded";
    }
    
    /// @notice Update governance parameters (only owner)
    function updateGovernanceParameters(
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumPercentage
    ) external onlyOwner {
        require(_votingPeriod > 0, "Invalid voting period");
        require(_quorumPercentage <= 100, "Invalid quorum");
        
        votingDelay = _votingDelay;
        votingPeriod = _votingPeriod;
        proposalThreshold = _proposalThreshold;
        quorumPercentage = _quorumPercentage;
    }
}



