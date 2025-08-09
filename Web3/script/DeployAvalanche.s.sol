// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Deploy.s.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Avalanche Deployment
 * @dev Avalanche-specific deployment with network validation and optimized settings
 */
contract DeployAvalanche is DeployScript {
    using Strings for uint256;
    using Strings for address;

    event DeploymentInfoSaved(string filename);
    event AvalancheDeploymentCompleted(
        address eventContract,
        address eventManager,
        address marketplace
    );

    function setUp() public override {
        // Initialize config script from parent
        super.setUp();
        
        // Get the current chain ID
        uint256 chainId = block.chainid;
        
        // Set default values if not Fuji testnet
        if (chainId == 43113) { // Fuji testnet
            // Get private key from environment and convert to uint256
            string memory privateKeyStr = vm.envString("PRIVATE_KEY");
            uint256 privateKey = vm.parseUint(privateKeyStr);
            config.deployer = vm.addr(privateKey);
            config.contractOwner = vm.envOr("CONTRACT_OWNER", config.deployer);
            config.marketplaceOwner = vm.envOr("MARKETPLACE_OWNER", config.deployer);
            config.marketplaceFee = vm.envOr("MARKETPLACE_FEE", uint256(250));
        }

        console.log("\n=== Avalanche Deployment Configuration ===");
        console.log("Network:          ", chainId == 43113 ? "Avalanche Fuji" : "Unknown Network");
        console.log("Chain ID:         ", chainId);
        console.log("Deployer:         ", config.deployer);
        console.log("Contract Owner:   ", config.contractOwner);
        console.log("Marketplace Owner:", config.marketplaceOwner);
        console.log("Marketplace Fee:  ", config.marketplaceFee, "bps");
        console.log("======================================");
    }

    function run() public override {
        console.log("\n=== Starting Deployment ===");
        console.log("Network: ", block.chainid == 43113 ? "Avalanche Fuji" : "Unknown Network");
        console.log("Chain ID: ", block.chainid);
        console.log("Deployer: ", config.deployer);

        // Get private key from environment and convert to uint256
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 privateKey = vm.parseUint(privateKeyStr);
        
        vm.startBroadcast(privateKey);
        super.run();
        vm.stopBroadcast();

        saveDeploymentInfo();
        emit AvalancheDeploymentCompleted(
            contracts.eventContract,
            contracts.eventManager,
            contracts.marketplace
        );
    }

    function saveDeploymentInfo() internal {
        string memory networkName = block.chainid == 43113 ? "fuji" : "unknown";
        string memory timestamp = Strings.toString(block.timestamp);
        
        // Instead of trying to create directory, just log the deployment info
        // The actual file writing will be handled by Foundry's artifacts
        string memory deploymentInfo = string(
            abi.encodePacked(
                "{\n",
                "  \"network\": \"Avalanche ", networkName, "\",\n",
                "  \"chainId\": ", Strings.toString(block.chainid), ",\n",
                "  \"deploymentDate\": \"", timestamp, "\",\n",
                "  \"deployer\": \"", Strings.toHexString(msg.sender), "\",\n",
                "  \"contracts\": {\n",
                "    \"eventContract\": \"", Strings.toHexString(address(contracts.eventContract)), "\",\n",
                "    \"eventManager\": \"", Strings.toHexString(address(contracts.eventManager)), "\",\n",
                "    \"marketplace\": \"", Strings.toHexString(address(contracts.marketplace)), "\"\n",
                "  },\n",
                "  \"configuration\": {\n",
                "    \"contractOwner\": \"", Strings.toHexString(config.contractOwner), "\",\n",
                "    \"marketplaceOwner\": \"", Strings.toHexString(config.marketplaceOwner), "\",\n",
                "    \"marketplaceFeeBps\": ", Strings.toString(config.marketplaceFee), "\n",
                "  }\n",
                "}"
            )
        );
        
        // Log the deployment info to console
        console.log("\n=== Deployment Info ===");
        console.log("Save the following deployment info to a JSON file:");
        console.log(deploymentInfo);
        console.log("=========================\n");
        
        // Emit an event with the deployment info
        string memory filename = string(abi.encodePacked("deployments/avalanche-", networkName, "-", timestamp, ".json"));
        emit DeploymentInfoSaved(filename);
    }
}
