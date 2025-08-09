// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Deploy.s.sol";
import "./Config.s.sol";

/**
 * @title Local Development Deployment
 * @dev Deploys contracts to Anvil with test data
 */
contract DeployLocal is DeployScript {
    address constant TEST_ACCOUNT_1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant TEST_ACCOUNT_2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

    function setUp() public override {
        config.deployer = vm.envOr("DEPLOYER_ADDRESS", msg.sender);
        config.contractOwner = vm.envOr("CONTRACT_OWNER", TEST_ACCOUNT_1);
        config.marketplaceOwner = vm.envOr("MARKETPLACE_OWNER", TEST_ACCOUNT_2);
        config.marketplaceFee = 100; // 1%

        console.log("=== Local Development Configuration ===");
        console.log("Deployer:         ", config.deployer);
        console.log("Contract Owner:   ", config.contractOwner);
        console.log("Marketplace Owner:", config.marketplaceOwner);
        console.log("Marketplace Fee:  ", config.marketplaceFee, "bps");
        console.log("=====================================");
    }

    function run() public override {
        vm.startBroadcast(config.deployer);
        super.run();
        setupTestData();
        vm.stopBroadcast();
    }

    function setupTestData() internal {
        console.log("\n--- Setting Up Test Data ---");
        // Add test event creation calls here
    }
}
