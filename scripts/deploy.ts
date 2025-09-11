import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Kaia Yield Optimizer contracts...");

  // Get the contract factories
  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const YieldVault = await ethers.getContractFactory("YieldVault");

  // Deploy USDT mock token for testing (replace with actual USDT address on mainnet)
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.deployed();
  console.log("Mock USDT deployed to:", usdt.address);

  // Deploy Strategy Manager
  const strategyManager = await StrategyManager.deploy(usdt.address);
  await strategyManager.deployed();
  console.log("StrategyManager deployed to:", strategyManager.address);

  // Deploy Yield Vault
  const [deployer] = await ethers.getSigners();
  const yieldVault = await YieldVault.deploy(
    usdt.address,
    "Kaia Yield Vault",
    "KYV",
    strategyManager.address,
    deployer.address // Fee recipient
  );
  await yieldVault.deployed();
  console.log("YieldVault deployed to:", yieldVault.address);

  // Add some mock strategies (replace with actual strategy addresses)
  console.log("Adding mock strategies...");
  
  // Mock Aave Strategy
  const MockAaveStrategy = await ethers.getContractFactory("MockAaveStrategy");
  const aaveStrategy = await MockAaveStrategy.deploy(usdt.address);
  await aaveStrategy.deployed();
  console.log("Mock Aave Strategy deployed to:", aaveStrategy.address);

  // Mock KlaySwap Strategy
  const MockKlaySwapStrategy = await ethers.getContractFactory("MockKlaySwapStrategy");
  const klaySwapStrategy = await MockKlaySwapStrategy.deploy(usdt.address);
  await klaySwapStrategy.deployed();
  console.log("Mock KlaySwap Strategy deployed to:", klaySwapStrategy.address);

  // Add strategies to manager
  await strategyManager.addStrategy(aaveStrategy.address, 4000); // 40%
  await strategyManager.addStrategy(klaySwapStrategy.address, 6000); // 60%

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", await ethers.provider.getNetwork());
  console.log("Deployer:", deployer.address);
  console.log("USDT Token:", usdt.address);
  console.log("Strategy Manager:", strategyManager.address);
  console.log("Yield Vault:", yieldVault.address);
  console.log("Aave Strategy:", aaveStrategy.address);
  console.log("KlaySwap Strategy:", klaySwapStrategy.address);

  // Verify contracts on block explorer
  console.log("\n=== Verification ===");
  console.log("To verify contracts, run:");
  console.log(`npx hardhat verify --network kaiaTestnet ${usdt.address}`);
  console.log(`npx hardhat verify --network kaiaTestnet ${strategyManager.address} "${usdt.address}"`);
  console.log(`npx hardhat verify --network kaiaTestnet ${yieldVault.address} "${usdt.address}" "Kaia Yield Vault" "KYV" "${strategyManager.address}" "${deployer.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
