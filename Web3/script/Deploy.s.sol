// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import "./Config.s.sol";
import "../src/EventContract.sol";
import "../src/EventManager.sol";
import "../src/Marketplace.sol";

/**
 * @title FairPass Base Deployment Script
 * @dev Handles the deployment of EventContract, EventManager, and Marketplace
 */
contract DeployScript is Script {
    struct DeploymentConfig {
        address deployer;
        address contractOwner;
        address marketplaceOwner;
        uint256 marketplaceFee; // in basis points (100 = 1%)
    }

    struct Contracts {
        address eventContract;
        address eventManager;
        address marketplace;
    }

    event ContractDeployed(string name, address addr);
    event ContractConfigured(string name, address addr);
    event DeploymentCompleted(address eventContract, address eventManager, address marketplace);

    Contracts public contracts;
    DeploymentConfig public config;
    ConfigScript public configScript;

    function setUp() public virtual {
        // Initialize config script
        configScript = new ConfigScript();
        
        // Load configuration from environment variables
        config.deployer = msg.sender; // Default to msg.sender, can be overridden by child contracts
        config.contractOwner = vm.envOr("CONTRACT_OWNER", config.deployer);
        config.marketplaceOwner = vm.envOr("MARKETPLACE_OWNER", config.deployer);
        config.marketplaceFee = vm.envOr("MARKETPLACE_FEE", uint256(250)); // 2.5% default

        // Validate configuration
        require(config.contractOwner != address(0), "Invalid contract owner address");
        require(config.marketplaceOwner != address(0), "Invalid marketplace owner address");
        require(config.marketplaceFee <= 1000, "Marketplace fee too high (max 10%)");

        console.log("=== Deployment Configuration ===");
        console.log("Deployer:         ", config.deployer);
        console.log("Contract Owner:   ", config.contractOwner);
        console.log("Marketplace Owner:", config.marketplaceOwner);
        console.log("Marketplace Fee:  ", config.marketplaceFee, "bps");
        console.log("===============================");
    }

    function run() public virtual {
        console.log("Starting deployment...");

        // Deploy contracts
        deployContracts();

        // Configure contracts
        configureContracts();

        // Log deployment results
        logDeployment();

        emit DeploymentCompleted(
            contracts.eventContract,
            contracts.eventManager,
            contracts.marketplace
        );
    }

    function deployContracts() internal virtual {
        console.log("\n--- Deploying Contracts ---");

        console.log("Deploying EventContract...");
        EventContract eventContract = new EventContract(config.contractOwner);
        contracts.eventContract = address(eventContract);
        emit ContractDeployed("EventContract", contracts.eventContract);

        console.log("Deploying EventManager...");
        EventManager eventManager = new EventManager(
            config.contractOwner,
            contracts.eventContract
        );
        contracts.eventManager = address(eventManager);
        emit ContractDeployed("EventManager", contracts.eventManager);

        console.log("Deploying Marketplace...");
        Marketplace marketplace = new Marketplace(
            contracts.eventContract,
            config.marketplaceOwner
        );
        contracts.marketplace = address(marketplace);
        emit ContractDeployed("Marketplace", contracts.marketplace);
    }

    function configureContracts() internal virtual {
        console.log("\n--- Configuring Contracts ---");

        console.log("Configuring EventManager...");
        EventManager eventManager = EventManager(contracts.eventManager);
        (bool success1, ) = address(eventManager).call(
            abi.encodeWithSignature("setEventChainAddress(address)", contracts.marketplace)
        );
        require(success1, "Failed to set marketplace in EventManager");
        emit ContractConfigured("EventManager", contracts.eventManager);

        console.log("Configuring Marketplace...");
        Marketplace marketplace = Marketplace(payable(contracts.marketplace));
        
        // Set marketplace fee if different from default
        try marketplace.marketplaceFee() returns (uint256 currentFee) {
            if (currentFee != config.marketplaceFee) {
                (bool success2, ) = address(marketplace).call(
                    abi.encodeWithSignature("updateMarketplaceFee(uint256)", config.marketplaceFee)
                );
                require(success2, "Failed to set marketplace fee");
            }
        } catch Error(string memory reason) {
            console.log("Warning: Could not set marketplace fee - ", reason);
        } catch (bytes memory) {
            console.log("Warning: Could not set marketplace fee - unknown error");
        }

        // Transfer ownership if needed
        try marketplace.owner() returns (address currentOwner) {
            if (currentOwner != config.marketplaceOwner) {
                (bool success3, ) = address(marketplace).call(
                    abi.encodeWithSignature("transferOwnership(address)", config.marketplaceOwner)
                );
                require(success3, "Failed to transfer Marketplace ownership");
            }
        } catch Error(string memory reason) {
            console.log("Warning: Could not transfer ownership - ", reason);
        } catch (bytes memory) {
            console.log("Warning: Could not check/transfer ownership - unknown error");
        }
        
        emit ContractConfigured("Marketplace", contracts.marketplace);
    }

    function logDeployment() internal virtual {
        console.log("\n--- Deployment Summary ---");
        console.log("EventContract:", contracts.eventContract);
        console.log("EventManager: ", contracts.eventManager);
        console.log("Marketplace:   ", contracts.marketplace);
        console.log("---------------------------");
    }
}
