// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title Network Configuration
 * @dev Provides network-specific configurations for different chains
 */
contract ConfigScript is Script {
    struct NetworkConfig {
        string name;
        uint256 chainId;
        string rpcUrl;
        uint256 defaultGasPrice;
        uint256 deployerPk;
        bool isTestnet;
    }

    mapping(uint256 => NetworkConfig) public networkConfigs;

    constructor() {
        setupNetworkConfigs();
    }

    function setupNetworkConfigs() internal {
        // Avalanche Mainnet
        networkConfigs[43114] = NetworkConfig({
            name: "Avalanche Mainnet",
            chainId: 43114,
            rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
            defaultGasPrice: 30 gwei,
            deployerPk: vm.envUint("PRIVATE_KEY"),
            isTestnet: false
        });

        // Avalanche Fuji Testnet
        networkConfigs[43113] = NetworkConfig({
            name: "Avalanche Fuji",
            chainId: 43113,
            rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
            defaultGasPrice: 25 gwei,
            deployerPk: vm.envUint("PRIVATE_KEY"),
            isTestnet: true
        });

        // Local Anvil
        networkConfigs[31337] = NetworkConfig({
            name: "Anvil Local",
            chainId: 31337,
            rpcUrl: "http://localhost:8545",
            defaultGasPrice: 0,
            deployerPk: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80, // Default Anvil PK
            isTestnet: true
        });
    }

    function getNetworkConfig(uint256 chainId) public view returns (NetworkConfig memory) {
        require(bytes(networkConfigs[chainId].rpcUrl).length > 0, "Unsupported network");
        return networkConfigs[chainId];
    }

    function getCurrentNetworkConfig() public view returns (NetworkConfig memory) {
        return getNetworkConfig(block.chainid);
    }

    function validateEnvironment() public view returns (bool) {
        NetworkConfig memory config = getCurrentNetworkConfig();
        
        console.log("\n=== Environment Validation ===");
        console.log("Network: ", config.name);
        console.log("Chain ID: ", config.chainId);
        console.log("RPC URL: ", config.rpcUrl);
        
        // Check RPC URL is set
        require(bytes(config.rpcUrl).length > 0, "RPC URL not set");
        
        // Check private key is set
        require(config.deployerPk != 0, "Deployer private key not set");
        
        // Get deployer address from private key
        address deployer = vm.addr(config.deployerPk);
        require(deployer != address(0), "Invalid deployer address");
        
        // Check deployer has funds (for non-local networks)
        if (config.chainId != 31337) {
            uint256 balance = deployer.balance;
            console.log("Deployer balance:", balance / 1e18, "AVAX");
            require(balance > 0.1 ether, "Insufficient balance for deployment");
        }
        
        console.log("Environment validation passed\n");
        return true;
    }
}
