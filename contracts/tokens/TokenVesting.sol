// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./YieldToken.sol";

/**
 * @title TokenVesting
 * @dev Contract for vesting LYT tokens with different vesting schedules
 * Features: Linear vesting, cliff periods, team allocations, investor vesting
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for YieldToken;

    // Vesting schedule structure
    struct VestingSchedule {
        bool initialized;           // Whether schedule is initialized
        bool revocable;            // Whether schedule can be revoked
        uint256 startTime;         // When vesting starts
        uint256 duration;          // Total vesting duration
        uint256 cliff;             // Cliff period (tokens locked until this time)
        uint256 amount;            // Total amount to vest
        uint256 released;          // Amount already released
        uint256 revocableAmount;   // Amount that can be revoked
    }

    // Contract state
    YieldToken public immutable yieldToken;
    
    // Vesting schedules mapping
    mapping(address => VestingSchedule) public vestingSchedules;
    mapping(address => bool) public authorizedVesters;
    
    // Global state
    uint256 public totalVested;
    uint256 public totalReleased;
    uint256 public totalRevoked;
    
    // Events
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 startTime,
        uint256 duration,
        uint256 cliff,
        uint256 amount,
        bool revocable
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 amount);
    event AuthorizedVesterUpdated(address indexed vester, bool authorized);

    constructor(address _yieldToken) {
        require(_yieldToken != address(0), "Invalid yield token address");
        yieldToken = YieldToken(_yieldToken);
        
        // Authorize owner as vester
        authorizedVesters[msg.sender] = true;
    }

    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary The address to vest tokens to
     * @param startTime When vesting starts (0 = now)
     * @param duration Total vesting duration in seconds
     * @param cliff Cliff period in seconds (tokens locked until startTime + cliff)
     * @param amount Total amount to vest
     * @param revocable Whether the vesting can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 startTime,
        uint256 duration,
        uint256 cliff,
        uint256 amount,
        bool revocable
    ) external onlyAuthorizedVester {
        require(beneficiary != address(0), "Cannot vest to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        require(cliff <= duration, "Cliff cannot exceed duration");
        require(!vestingSchedules[beneficiary].initialized, "Vesting schedule already exists");
        
        // Use current time if startTime is 0
        if (startTime == 0) {
            startTime = block.timestamp;
        }
        
        // Transfer tokens to this contract
        yieldToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Create vesting schedule
        vestingSchedules[beneficiary] = VestingSchedule({
            initialized: true,
            revocable: revocable,
            startTime: startTime,
            duration: duration,
            cliff: cliff,
            amount: amount,
            released: 0,
            revocableAmount: revocable ? amount : 0
        });
        
        totalVested = totalVested.add(amount);
        
        emit VestingScheduleCreated(beneficiary, startTime, duration, cliff, amount, revocable);
    }

    /**
     * @dev Create multiple vesting schedules in batch
     * @param beneficiaries Array of beneficiary addresses
     * @param startTimes Array of start times
     * @param durations Array of durations
     * @param cliffs Array of cliff periods
     * @param amounts Array of amounts
     * @param revocable Whether schedules are revocable
     */
    function batchCreateVestingSchedules(
        address[] calldata beneficiaries,
        uint256[] calldata startTimes,
        uint256[] calldata durations,
        uint256[] calldata cliffs,
        uint256[] calldata amounts,
        bool revocable
    ) external onlyAuthorizedVester {
        require(beneficiaries.length == startTimes.length, "Arrays length mismatch");
        require(beneficiaries.length == durations.length, "Arrays length mismatch");
        require(beneficiaries.length == cliffs.length, "Arrays length mismatch");
        require(beneficiaries.length == amounts.length, "Arrays length mismatch");
        require(beneficiaries.length > 0, "Empty arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount = totalAmount.add(amounts[i]);
        }
        
        // Transfer all tokens to this contract
        yieldToken.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            require(beneficiaries[i] != address(0), "Cannot vest to zero address");
            require(amounts[i] > 0, "Amount must be greater than zero");
            require(durations[i] > 0, "Duration must be greater than zero");
            require(cliffs[i] <= durations[i], "Cliff cannot exceed duration");
            require(!vestingSchedules[beneficiaries[i]].initialized, "Vesting schedule already exists");
            
            uint256 startTime = startTimes[i] == 0 ? block.timestamp : startTimes[i];
            
            vestingSchedules[beneficiaries[i]] = VestingSchedule({
                initialized: true,
                revocable: revocable,
                startTime: startTime,
                duration: durations[i],
                cliff: cliffs[i],
                amount: amounts[i],
                released: 0,
                revocableAmount: revocable ? amounts[i] : 0
            });
            
            emit VestingScheduleCreated(beneficiaries[i], startTime, durations[i], cliffs[i], amounts[i], revocable);
        }
        
        totalVested = totalVested.add(totalAmount);
    }

    /**
     * @dev Release vested tokens to beneficiary
     * @param beneficiary The beneficiary address
     */
    function release(address beneficiary) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.initialized, "Vesting schedule does not exist");
        
        uint256 releasableAmount = getReleasableAmount(beneficiary);
        require(releasableAmount > 0, "No tokens to release");
        
        schedule.released = schedule.released.add(releasableAmount);
        totalReleased = totalReleased.add(releasableAmount);
        
        yieldToken.safeTransfer(beneficiary, releasableAmount);
        
        emit TokensReleased(beneficiary, releasableAmount);
    }

    /**
     * @dev Release tokens for multiple beneficiaries
     * @param beneficiaries Array of beneficiary addresses
     */
    function batchRelease(address[] calldata beneficiaries) external nonReentrant {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            VestingSchedule storage schedule = vestingSchedules[beneficiaries[i]];
            if (schedule.initialized) {
                uint256 releasableAmount = getReleasableAmount(beneficiaries[i]);
                if (releasableAmount > 0) {
                    schedule.released = schedule.released.add(releasableAmount);
                    totalReleased = totalReleased.add(releasableAmount);
                    
                    yieldToken.safeTransfer(beneficiaries[i], releasableAmount);
                    
                    emit TokensReleased(beneficiaries[i], releasableAmount);
                }
            }
        }
    }

    /**
     * @dev Revoke vesting schedule (only for revocable schedules)
     * @param beneficiary The beneficiary address
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.initialized, "Vesting schedule does not exist");
        require(schedule.revocable, "Vesting schedule is not revocable");
        
        uint256 revocableAmount = schedule.amount.sub(schedule.released);
        require(revocableAmount > 0, "No tokens to revoke");
        
        schedule.revocableAmount = 0;
        totalRevoked = totalRevoked.add(revocableAmount);
        
        yieldToken.safeTransfer(owner(), revocableAmount);
        
        emit VestingRevoked(beneficiary, revocableAmount);
    }

    /**
     * @dev Calculate releasable amount for a beneficiary
     * @param beneficiary The beneficiary address
     * @return The releasable amount
     */
    function getReleasableAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        if (!schedule.initialized) {
            return 0;
        }
        
        return getVestedAmount(beneficiary).sub(schedule.released);
    }

    /**
     * @dev Calculate vested amount for a beneficiary
     * @param beneficiary The beneficiary address
     * @return The vested amount
     */
    function getVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        if (!schedule.initialized) {
            return 0;
        }
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) {
            return 0;
        }
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime.add(schedule.cliff)) {
            return 0;
        }
        
        // Calculate vested amount based on linear vesting
        uint256 timeElapsed = block.timestamp.sub(schedule.startTime);
        if (timeElapsed >= schedule.duration) {
            return schedule.amount;
        }
        
        return schedule.amount.mul(timeElapsed).div(schedule.duration);
    }

    /**
     * @dev Get vesting schedule information
     * @param beneficiary The beneficiary address
     * @return schedule The vesting schedule
     * @return vestedAmount The vested amount
     * @return releasableAmount The releasable amount
     */
    function getVestingInfo(address beneficiary) external view returns (
        VestingSchedule memory schedule,
        uint256 vestedAmount,
        uint256 releasableAmount
    ) {
        schedule = vestingSchedules[beneficiary];
        vestedAmount = getVestedAmount(beneficiary);
        releasableAmount = getReleasableAmount(beneficiary);
    }

    /**
     * @dev Get contract statistics
     * @return totalVested Total tokens vested
     * @return totalReleased Total tokens released
     * @return totalRevoked Total tokens revoked
     */
    function getContractStats() external view returns (
        uint256 totalVested,
        uint256 totalReleased,
        uint256 totalRevoked
    ) {
        return (totalVested, totalReleased, totalRevoked);
    }

    /**
     * @dev Authorize or deauthorize a vester
     * @param vester The address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuthorizedVester(address vester, bool authorized) external onlyOwner {
        require(vester != address(0), "Cannot set zero address");
        authorizedVesters[vester] = authorized;
        emit AuthorizedVesterUpdated(vester, authorized);
    }

    /**
     * @dev Emergency function to recover tokens (only owner)
     * @param token The token address
     * @param amount The amount to recover
     */
    function emergencyRecover(address token, uint256 amount) external onlyOwner {
        require(token != address(yieldToken), "Cannot recover yield tokens");
        IERC20(token).safeTransfer(owner(), amount);
    }

    // Modifiers
    modifier onlyAuthorizedVester() {
        require(authorizedVesters[msg.sender] || msg.sender == owner(), "Not authorized vester");
        _;
    }
}



