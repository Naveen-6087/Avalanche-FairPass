// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import "./Config.s.sol";

/**
 * @title Contract Verification Helper
 * @dev Generates verification commands for block explorers
 */
contract VerifyScript is Script {
    ConfigScript configScript;

    struct ContractInfo {
        string name;
        address addr;
        string constructorArgs;
    }

    ContractInfo[] public contracts;

    function setUp() public {
        configScript = new ConfigScript();
    }

    function addContract(
        string memory name,
        address addr,
        string memory constructorArgs
    ) public {
        contracts.push(ContractInfo(name, addr, constructorArgs));
    }

    function run() public {
        ConfigScript.NetworkConfig memory cfg = configScript.getCurrentNetworkConfig();

        console.log("\n=== Contract Verification Commands ===");
        console.log("Network: ", cfg.name);
        console.log("Chain ID: ", cfg.chainId);

        for (uint i = 0; i < contracts.length; i++) {
            ContractInfo memory c = contracts[i];
            console.log("\n# ", c.name);
            console.log("Address: ", c.addr);
            string memory cmd = string(
                abi.encodePacked(
                    "forge verify-contract ",
                    vm.toString(c.addr),
                    " ",
                    getContractPath(c.name),
                    getChainParam(cfg.chainId)
                )
            );
            if (bytes(c.constructorArgs).length > 0) {
                cmd = string(abi.encodePacked(cmd, " --constructor-args ", c.constructorArgs));
            }
            console.log(cmd);
        }
    }

    function getContractPath(string memory name) internal pure returns (string memory) {
        if (keccak256(bytes(name)) == keccak256("EventContract")) {
            return "src/EventContract.sol:EventContract";
        } else if (keccak256(bytes(name)) == keccak256("EventManager")) {
            return "src/EventManager.sol:EventManager";
        } else if (keccak256(bytes(name)) == keccak256("Marketplace")) {
            return "src/Marketplace.sol:Marketplace";
        }
        return "";
    }

    function getChainParam(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 43114) return " --chain avalanche";
        if (chainId == 43113) return " --chain avalanche-fuji";
        if (chainId == 1) return " --chain ethereum";
        if (chainId == 5) return " --chain goerli";
        if (chainId == 137) return " --chain polygon";
        if (chainId == 80001) return " --chain mumbai";
        return "";
    }
}
