import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    kaiaTestnet: {
      url: "https://api.baobab.klaytn.net:8651",
      chainId: 1001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
    kaiaMainnet: {
      url: "https://public-en-kaia.klaytn.net",
      chainId: 8217,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
  },
  etherscan: {
    apiKey: {
      kaiaTestnet: "your-klaytnscope-api-key",
      kaiaMainnet: "your-klaytnscope-api-key",
    },
    customChains: [
      {
        network: "kaiaTestnet",
        chainId: 1001,
        urls: {
          apiURL: "https://api-baobab.klaytnscope.com/api",
          browserURL: "https://baobab.klaytnscope.com"
        }
      },
      {
        network: "kaiaMainnet",
        chainId: 8217,
        urls: {
          apiURL: "https://api.klaytnscope.com/api",
          browserURL: "https://klaytnscope.com"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
