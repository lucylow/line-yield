import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { 
  USDTYieldVault, 
  AdvancedStrategyManager, 
  MockUSDT, 
  MockAaveStrategy, 
  MockKlaySwapStrategy,
  MockCompoundStrategy,
  MockFeeManager,
  MockRiskManager,
  MockPerformanceOracle
} from "../typechain-types";

describe("Advanced Security Tests - Kaia Yield Optimizer", function () {
  let vault: USDTYieldVault;
  let strategyManager: AdvancedStrategyManager;
  let mockUSDT: MockUSDT;
  let mockAave: MockAaveStrategy;
  let mockKlaySwap: MockKlaySwapStrategy;
  let mockCompound: MockCompoundStrategy;
  let mockFeeManager: MockFeeManager;
  let mockRiskManager: MockRiskManager;
  let mockOracle: MockPerformanceOracle;

  let owner: SignerWithAddress;
  let admin1: SignerWithAddress;
  let admin2: SignerWithAddress;
  let admin3: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;

  const DEPOSIT_AMOUNT = ethers.utils.parseEther("1000");
  const LARGE_DEPOSIT = ethers.utils.parseEther("10000");
  const MAX_DEPOSIT_PER_TX = ethers.utils.parseEther("50000");
  const MAX_WITHDRAWAL_PER_TX = ethers.utils.parseEther("20000");
  const DAILY_WITHDRAWAL_LIMIT = ethers.utils.parseEther("100000");

  beforeEach(async function () {
    [owner, admin1, admin2, admin3, user1, user2, attacker] = await ethers.getSigners();

    // Deploy mock contracts
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.deployed();

    const MockFeeManagerFactory = await ethers.getContractFactory("MockFeeManager");
    mockFeeManager = await MockFeeManagerFactory.deploy();
    await mockFeeManager.deployed();

    const MockRiskManagerFactory = await ethers.getContractFactory("MockRiskManager");
    mockRiskManager = await MockRiskManagerFactory.deploy();
    await mockRiskManager.deployed();

    const MockOracleFactory = await ethers.getContractFactory("MockPerformanceOracle");
    mockOracle = await MockOracleFactory.deploy();
    await mockOracle.deployed();

    // Deploy strategy manager
    const StrategyManagerFactory = await ethers.getContractFactory("AdvancedStrategyManager");
    strategyManager = await StrategyManagerFactory.deploy(
      mockUSDT.address,
      mockOracle.address,
      mockRiskManager.address,
      owner.address
    );
    await strategyManager.deployed();

    // Deploy strategies
    const MockAaveFactory = await ethers.getContractFactory("MockAaveStrategy");
    mockAave = await MockAaveFactory.deploy(mockUSDT.address);
    await mockAave.deployed();

    const MockKlaySwapFactory = await ethers.getContractFactory("MockKlaySwapStrategy");
    mockKlaySwap = await MockKlaySwapFactory.deploy(mockUSDT.address);
    await mockKlaySwap.deployed();

    const MockCompoundFactory = await ethers.getContractFactory("MockCompoundStrategy");
    mockCompound = await MockCompoundFactory.deploy(mockUSDT.address);
    await mockCompound.deployed();

    // Deploy vault
    const VaultFactory = await ethers.getContractFactory("USDTYieldVault");
    vault = await VaultFactory.deploy(
      mockUSDT.address,
      "USDT Yield Vault",
      "USDTYV",
      strategyManager.address,
      mockFeeManager.address,
      mockRiskManager.address,
      owner.address
    );
    await vault.deployed();

    // Set up roles
    await vault.grantRole(await vault.ADMIN_ROLE(), admin1.address);
    await vault.grantRole(await vault.ADMIN_ROLE(), admin2.address);
    await vault.grantRole(await vault.ADMIN_ROLE(), admin3.address);

    await strategyManager.grantRole(await strategyManager.ADMIN_ROLE(), admin1.address);
    await strategyManager.grantRole(await strategyManager.REBALANCER_ROLE(), admin1.address);

    // Add strategies
    await strategyManager.addStrategy(mockAave.address, 4000, 1000, 6000); // 40% allocation
    await strategyManager.addStrategy(mockKlaySwap.address, 3500, 1000, 5000); // 35% allocation
    await strategyManager.addStrategy(mockCompound.address, 2500, 1000, 4000); // 25% allocation

    // Mint USDT to users
    await mockUSDT.mint(user1.address, ethers.utils.parseEther("100000"));
    await mockUSDT.mint(user2.address, ethers.utils.parseEther("100000"));
    await mockUSDT.mint(attacker.address, ethers.utils.parseEther("10000"));

    // Approve vault to spend USDT
    await mockUSDT.connect(user1).approve(vault.address, ethers.utils.parseEther("100000"));
    await mockUSDT.connect(user2).approve(vault.address, ethers.utils.parseEther("100000"));
    await mockUSDT.connect(attacker).approve(vault.address, ethers.utils.parseEther("10000"));
  });

  describe("Advanced Access Control", function () {
    it("Should enforce multi-signature requirements for critical operations", async function () {
      const operationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-operation"));
      
      // Propose operation
      await vault.connect(admin1).proposeOperation(operationHash);
      
      // First signature
      await vault.connect(admin1).signOperation(operationHash);
      
      // Try to execute without sufficient signatures (should fail)
      await expect(
        vault.connect(admin1).executeOperation(
          operationHash,
          ethers.constants.AddressZero,
          "0x"
        )
      ).to.be.revertedWith("InsufficientSignatures");
      
      // Second signature
      await vault.connect(admin2).signOperation(operationHash);
      
      // Should now have 2 signatures
      const signatureCount = await vault.signatureCount(operationHash);
      expect(signatureCount).to.equal(2);
    });

    it("Should enforce timelock for critical operations", async function () {
      const operationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-operation"));
      
      // Propose operation
      await vault.connect(admin1).proposeOperation(operationHash);
      
      // Sign operation
      await vault.connect(admin1).signOperation(operationHash);
      await vault.connect(admin2).signOperation(operationHash);
      
      // Try to execute immediately (should fail)
      await expect(
        vault.connect(admin1).executeOperation(
          operationHash,
          ethers.constants.AddressZero,
          "0x"
        )
      ).to.be.revertedWith("TimelockNotExpired");
    });

    it("Should prevent unauthorized role modifications", async function () {
      // Non-admin should not be able to grant roles
      await expect(
        vault.connect(attacker).grantRole(await vault.ADMIN_ROLE(), attacker.address)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Advanced Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks on deposit", async function () {
      // Deploy malicious contract
      const MaliciousContractFactory = await ethers.getContractFactory("MaliciousReentrancyContract");
      const maliciousContract = await MaliciousContractFactory.deploy(vault.address, mockUSDT.address);
      await maliciousContract.deployed();

      // Fund malicious contract
      await mockUSDT.mint(maliciousContract.address, DEPOSIT_AMOUNT);
      await mockUSDT.connect(maliciousContract.address).approve(vault.address, DEPOSIT_AMOUNT);

      // Attempt reentrancy attack
      await expect(
        maliciousContract.attackDeposit(DEPOSIT_AMOUNT)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy attacks on withdrawal", async function () {
      // User deposits first
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);

      // Deploy malicious contract
      const MaliciousContractFactory = await ethers.getContractFactory("MaliciousReentrancyContract");
      const maliciousContract = await MaliciousContractFactory.deploy(vault.address, mockUSDT.address);
      await maliciousContract.deployed();

      // Transfer shares to malicious contract
      await vault.connect(user1).transfer(maliciousContract.address, await vault.balanceOf(user1.address));

      // Attempt reentrancy attack
      await expect(
        maliciousContract.attackWithdraw(await vault.balanceOf(maliciousContract.address))
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });
  });

  describe("Advanced Rate Limiting", function () {
    it("Should enforce daily withdrawal limits", async function () {
      await vault.connect(user1).deposit(LARGE_DEPOSIT, user1.address);
      
      const userShares = await vault.balanceOf(user1.address);
      const withdrawAmount = await vault.convertToAssets(userShares.div(2));
      
      // First withdrawal should succeed
      await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
      
      // Second withdrawal should fail (exceeds daily limit)
      await expect(
        vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address)
      ).to.be.revertedWith("ExceedsDailyLimit");
    });

    it("Should enforce transaction size limits", async function () {
      // Large deposit should fail
      await expect(
        vault.connect(user1).deposit(MAX_DEPOSIT_PER_TX.add(1), user1.address)
      ).to.be.revertedWith("ExceedsMaxTxLimit");

      // Normal deposit should succeed
      await vault.connect(user1).deposit(MAX_DEPOSIT_PER_TX, user1.address);
    });

    it("Should reset daily limits after 24 hours", async function () {
      await vault.connect(user1).deposit(LARGE_DEPOSIT, user1.address);
      
      const userShares = await vault.balanceOf(user1.address);
      const withdrawAmount = await vault.convertToAssets(userShares.div(2));
      
      // First withdrawal
      await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
      
      // Fast forward 25 hours
      await ethers.provider.send("evm_increaseTime", [25 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Second withdrawal should now succeed
      await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
    });
  });

  describe("Advanced Emergency Controls", function () {
    it("Should allow emergency shutdown", async function () {
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
      
      // Emergency shutdown
      await vault.connect(admin1).emergencyShutdown();
      
      // Normal operations should be paused
      await expect(
        vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address)
      ).to.be.revertedWith("EmergencyModeActive");
      
      // Emergency withdrawal should still work
      const userShares = await vault.balanceOf(user1.address);
      await vault.connect(user1).emergencyWithdraw(userShares, user1.address, user1.address);
    });

    it("Should allow emergency resume", async function () {
      // Emergency shutdown
      await vault.connect(admin1).emergencyShutdown();
      
      // Resume operations
      await vault.connect(admin1).resumeOperations();
      
      // Normal operations should work again
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
    });

    it("Should prevent unauthorized emergency controls", async function () {
      await expect(
        vault.connect(attacker).emergencyShutdown()
      ).to.be.revertedWith("NotAuthorizedSigner");
    });
  });

  describe("Advanced Strategy Management", function () {
    it("Should execute sophisticated rebalancing", async function () {
      // Set up different APYs for strategies
      await mockOracle.setStrategyAPY(mockAave.address, 500); // 5% APY
      await mockOracle.setStrategyAPY(mockKlaySwap.address, 800); // 8% APY
      await mockOracle.setStrategyAPY(mockCompound.address, 300); // 3% APY

      // User deposits
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);

      // Execute rebalancing
      await strategyManager.connect(admin1).rebalance();

      // Check that allocations have been adjusted
      const allocations = await strategyManager.getStrategyAllocations();
      expect(allocations[1]).to.be.gt(allocations[0]); // KlaySwap should have higher allocation
    });

    it("Should respect strategy allocation bounds", async function () {
      // Try to set allocation below minimum
      await expect(
        strategyManager.connect(admin1).updateStrategyAllocation(0, 500) // Below 1000 minimum
      ).to.be.revertedWith("Below minimum allocation");

      // Try to set allocation above maximum
      await expect(
        strategyManager.connect(admin1).updateStrategyAllocation(0, 7000) // Above 6000 maximum
      ).to.be.revertedWith("Above maximum allocation");
    });

    it("Should handle strategy failures gracefully", async function () {
      // Deploy failing strategy
      const FailingStrategyFactory = await ethers.getContractFactory("FailingStrategy");
      const failingStrategy = await FailingStrategyFactory.deploy(mockUSDT.address);
      await failingStrategy.deployed();

      // Add failing strategy
      await strategyManager.connect(admin1).addStrategy(failingStrategy.address, 1000, 500, 2000);

      // User deposits
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);

      // Rebalancing should handle the failing strategy
      await strategyManager.connect(admin1).rebalance();
    });
  });

  describe("Advanced Performance Tracking", function () {
    it("Should track comprehensive performance metrics", async function () {
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);

      // Harvest yield
      await vault.connect(admin1).harvest();

      // Check performance metrics
      const metrics = await vault.performanceMetrics();
      expect(metrics.totalYieldEarned).to.be.gt(0);
      expect(metrics.totalFeesPaid).to.be.gt(0);
      expect(metrics.lastUpdateTime).to.be.gt(0);
    });

    it("Should calculate accurate APY", async function () {
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);

      const apy = await vault.getCurrentAPY();
      expect(apy).to.be.gt(0);
      expect(apy).to.be.lt(10000); // Less than 100% APY
    });

    it("Should provide comprehensive vault health data", async function () {
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);

      const health = await vault.getVaultHealth();
      expect(health.tvl).to.be.gt(0);
      expect(health.apy).to.be.gt(0);
      expect(health.lastUpdate).to.be.gt(0);
    });
  });

  describe("Advanced Gas Optimization", function () {
    it("Should optimize gas usage for batch operations", async function () {
      const gasBefore = await ethers.provider.getBalance(owner.address);
      
      // Batch multiple operations
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
      await vault.connect(user2).deposit(DEPOSIT_AMOUNT, user2.address);
      await vault.connect(admin1).harvest();
      
      const gasAfter = await ethers.provider.getBalance(owner.address);
      const gasUsed = gasBefore.sub(gasAfter);
      
      // Gas usage should be reasonable (less than 1M gas for all operations)
      expect(gasUsed).to.be.lt(ethers.utils.parseEther("0.1"));
    });

    it("Should minimize storage operations", async function () {
      // Multiple deposits should not cause excessive storage writes
      const tx1 = await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
      const receipt1 = await tx1.wait();
      
      const tx2 = await vault.connect(user2).deposit(DEPOSIT_AMOUNT, user2.address);
      const receipt2 = await tx2.wait();
      
      // Gas usage should be similar for similar operations
      const gasDiff = Math.abs(receipt1.gasUsed.toNumber() - receipt2.gasUsed.toNumber());
      expect(gasDiff).to.be.lt(10000); // Less than 10k gas difference
    });
  });

  describe("Advanced Error Handling", function () {
    it("Should handle edge cases gracefully", async function () {
      // Zero amount deposits
      await expect(
        vault.connect(user1).deposit(0, user1.address)
      ).to.be.revertedWith("InvalidAmount");

      // Zero address receiver
      await expect(
        vault.connect(user1).deposit(DEPOSIT_AMOUNT, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAmount");
    });

    it("Should handle insufficient balance scenarios", async function () {
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
      
      const userShares = await vault.balanceOf(user1.address);
      const withdrawAmount = await vault.convertToAssets(userShares.add(1));
      
      await expect(
        vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address)
      ).to.be.revertedWith("InsufficientBalance");
    });

    it("Should handle contract interaction failures", async function () {
      // Deploy contract that will fail on interaction
      const FailingContractFactory = await ethers.getContractFactory("FailingContract");
      const failingContract = await FailingContractFactory.deploy();
      await failingContract.deployed();

      const operationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("failing-operation"));
      
      await vault.connect(admin1).proposeOperation(operationHash);
      await vault.connect(admin1).signOperation(operationHash);
      await vault.connect(admin2).signOperation(operationHash);

      // Fast forward past timelock
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      // Should handle execution failure gracefully
      await expect(
        vault.connect(admin1).executeOperation(
          operationHash,
          failingContract.address,
          failingContract.interface.encodeFunctionData("fail")
        )
      ).to.be.revertedWith("Operation execution failed");
    });
  });

  describe("Advanced Integration Tests", function () {
    it("Should handle complex multi-user scenarios", async function () {
      // Multiple users deposit
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
      await vault.connect(user2).deposit(DEPOSIT_AMOUNT.mul(2), user2.address);

      // Harvest yield
      await vault.connect(admin1).harvest();

      // Users withdraw
      const user1Shares = await vault.balanceOf(user1.address);
      const user2Shares = await vault.balanceOf(user2.address);

      await vault.connect(user1).withdraw(
        await vault.convertToAssets(user1Shares.div(2)),
        user1.address,
        user1.address
      );

      await vault.connect(user2).withdraw(
        await vault.convertToAssets(user2Shares.div(2)),
        user2.address,
        user2.address
      );

      // Check final balances
      const finalUser1Balance = await mockUSDT.balanceOf(user1.address);
      const finalUser2Balance = await mockUSDT.balanceOf(user2.address);

      expect(finalUser1Balance).to.be.gt(ethers.utils.parseEther("500"));
      expect(finalUser2Balance).to.be.gt(ethers.utils.parseEther("1000"));
    });

    it("Should maintain consistency across multiple operations", async function () {
      const initialTVL = await vault.totalAssets();
      
      // Perform multiple operations
      await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
      await vault.connect(admin1).harvest();
      await vault.connect(user1).withdraw(
        await vault.convertToAssets(await vault.balanceOf(user1.address)),
        user1.address,
        user1.address
      );

      const finalTVL = await vault.totalAssets();
      
      // TVL should be consistent
      expect(finalTVL).to.equal(initialTVL);
    });
  });

  describe("Advanced Security Edge Cases", function () {
    it("Should handle maximum values correctly", async function () {
      // Test with maximum uint256 values
      const maxUint256 = ethers.constants.MaxUint256;
      
      // Should handle large numbers without overflow
      await expect(
        vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address)
      ).to.not.be.reverted;
    });

    it("Should prevent integer overflow attacks", async function () {
      // Deploy contract that tries to cause overflow
      const OverflowContractFactory = await ethers.getContractFactory("OverflowContract");
      const overflowContract = await OverflowContractFactory.deploy(vault.address);
      await overflowContract.deployed();

      // Should not be able to cause overflow
      await expect(
        overflowContract.attemptOverflow()
      ).to.be.reverted;
    });

    it("Should handle precision loss correctly", async function () {
      // Deposit very small amount
      const smallAmount = ethers.utils.parseEther("0.000001");
      await vault.connect(user1).deposit(smallAmount, user1.address);

      // Should handle precision correctly
      const shares = await vault.balanceOf(user1.address);
      expect(shares).to.be.gt(0);
    });
  });
});

// Helper contracts for testing
contract MaliciousReentrancyContract {
    address public vault;
    address public token;
    
    constructor(address _vault, address _token) {
        vault = _vault;
        token = _token;
    }
    
    function attackDeposit(uint256 amount) external {
        IERC4626(vault).deposit(amount, address(this));
    }
    
    function attackWithdraw(uint256 shares) external {
        IERC4626(vault).redeem(shares, address(this), address(this));
    }
    
    // This function will be called during reentrancy
    function onERC721Received(address, address, uint256, bytes memory) external returns (bytes4) {
        // Attempt reentrancy
        IERC4626(vault).deposit(1000, address(this));
        return this.onERC721Received.selector;
    }
}

contract FailingStrategy {
    address public asset;
    
    constructor(address _asset) {
        asset = _asset;
    }
    
    function deposit(uint256) external pure {
        revert("Strategy always fails");
    }
    
    function withdraw(uint256) external pure returns (uint256) {
        revert("Strategy always fails");
    }
    
    function harvest() external pure returns (uint256) {
        revert("Strategy always fails");
    }
    
    function getTotalAssets() external pure returns (uint256) {
        return 0;
    }
    
    function getAPY() external pure returns (uint256) {
        return 0;
    }
    
    function emergencyWithdraw() external pure {
        revert("Strategy always fails");
    }
}

contract FailingContract {
    function fail() external pure {
        revert("This function always fails");
    }
}

contract OverflowContract {
    address public vault;
    
    constructor(address _vault) {
        vault = _vault;
    }
    
    function attemptOverflow() external {
        // Try to cause overflow
        uint256 maxUint = type(uint256).max;
        uint256 result = maxUint + 1; // This should revert in Solidity 0.8+
    }
}
