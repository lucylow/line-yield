import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying GaslessVault contract...");

  // Get the contract factory
  const GaslessVault = await ethers.getContractFactory("GaslessVault");

  // Contract parameters
  const assetAddress = "0x..."; // Replace with USDT contract address on Kaia
  const vaultName = "Kaia Yield Optimizer Vault";
  const vaultSymbol = "KYO-VAULT";
  const strategyManagerAddress = "0x..."; // Replace with StrategyManager address
  const feeRecipientAddress = "0x..."; // Replace with fee recipient address
  const relayerAddress = "0x..."; // Replace with relayer address

  console.log("📋 Deployment Parameters:");
  console.log(`  Asset (USDT): ${assetAddress}`);
  console.log(`  Vault Name: ${vaultName}`);
  console.log(`  Vault Symbol: ${vaultSymbol}`);
  console.log(`  Strategy Manager: ${strategyManagerAddress}`);
  console.log(`  Fee Recipient: ${feeRecipientAddress}`);
  console.log(`  Relayer: ${relayerAddress}`);

  // Deploy the contract
  const gaslessVault = await GaslessVault.deploy(
    assetAddress,
    vaultName,
    vaultSymbol,
    strategyManagerAddress,
    feeRecipientAddress,
    relayerAddress
  );

  await gaslessVault.waitForDeployment();

  const vaultAddress = await gaslessVault.getAddress();
  console.log(`✅ GaslessVault deployed to: ${vaultAddress}`);

  // Verify the deployment
  console.log("\n🔍 Verifying deployment...");
  
  try {
    const asset = await gaslessVault.asset();
    const name = await gaslessVault.name();
    const symbol = await gaslessVault.symbol();
    const strategyManager = await gaslessVault.strategyManager();
    const feeRecipient = await gaslessVault.feeRecipient();
    const relayer = await gaslessVault.relayer();

    console.log("✅ Contract verification successful:");
    console.log(`  Asset: ${asset}`);
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Strategy Manager: ${strategyManager}`);
    console.log(`  Fee Recipient: ${feeRecipient}`);
    console.log(`  Relayer: ${relayer}`);
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
  }

  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    contractAddress: vaultAddress,
    assetAddress,
    vaultName,
    vaultSymbol,
    strategyManagerAddress,
    feeRecipientAddress,
    relayerAddress,
    deploymentTime: new Date().toISOString(),
    deployer: await ethers.provider.getSigner().getAddress(),
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Update relayer service with the new vault address");
  console.log("2. Update frontend environment variables");
  console.log("3. Test gasless transactions");
  console.log("4. Deploy relayer service");
  console.log("5. Update Dune Analytics queries with new contract address");

  console.log("\n🔧 Environment Variables to Update:");
  console.log(`REACT_APP_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`VAULT_ADDRESS=${vaultAddress}`);

  return vaultAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
