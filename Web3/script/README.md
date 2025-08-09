# FairPass Deployment Scripts

This directory contains deployment scripts for the FairPass protocol on various networks. The scripts are built using Foundry's scripting system.

## Available Scripts

### Deployment Scripts

1. **`Deploy.s.sol`**
   - Base deployment script that handles the deployment of all three core contracts:
     - `EventContract`
     - `EventManager`
     - `Marketplace`

2. **`DeployLocal.s.sol`**
   - Local development deployment script for Anvil
   - Includes test data setup
   - Uses default Anvil accounts
   - No verification needed

3. **`DeployAvalanche.s.sol`**
   - Avalanche-specific deployment
   - Handles both Fuji testnet and Mainnet
   - Includes network validation
   - Saves deployment information to a JSON file

### Utility Scripts

1. **`Config.s.sol`**
   - Manages network configurations
   - Supports multiple chains (Avalanche, Ethereum, Polygon, etc.)
   - Provides environment validation

2. **`Verify.s.sol`**
   - Helper for contract verification
   - Generates verification commands for block explorers
   - Supports multiple networks

## Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Network (fuji, mainnet, or local)
NETWORK=fuji

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key

# Owner addresses
CONTRACT_OWNER=0x...
MARKETPLACE_OWNER=0x...

# RPC URLs
AVALANCHE_MAINNET_RPC_URL=your_mainnet_rpc_url
AVALANCHE_FUJI_RPC_URL=your_fuji_rpc_url

# Optional: Marketplace fee in basis points (100 = 1%)
# MARKETPLACE_FEE=250
```

## Deployment Commands

### Local Development

1. Start Anvil in a separate terminal:
   ```bash
   anvil
   ```

2. Deploy to local network:
   ```bash
   forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast -vvvv
   ```

### Avalanche Fuji Testnet

```bash
# Set network to fuji
export NETWORK=fuji

# Deploy to Fuji
export RPC_URL=$AVALANCHE_FUJI_RPC_URL
forge script script/DeployAvalanche.s.sol:DeployAvalanche --rpc-url $RPC_URL --broadcast -vvvv
```

### Avalanche Mainnet

```bash
# Set network to mainnet
export NETWORK=mainnet

# Deploy to Mainnet
export RPC_URL=$AVALANCHE_MAINNET_RPC_URL
forge script script/DeployAvalanche.s.sol:DeployAvalanche --rpc-url $RPC_URL --broadcast -vvvv
```

## Verifying Contracts

After deployment, you can verify your contracts using the `Verify.s.sol` script.

1. First, update the script with your contract addresses and constructor arguments:

```solidity
// In script/Verify.s.sol
function run() public {
    // Add your deployed contracts
    addContract("EventContract", 0x..., "0x..."); // Add constructor args as hex
    addContract("EventManager", 0x..., "0x...");
    addContract("Marketplace", 0x..., "0x...");
    
    // Run verification
    super.run();
}
```

2. Run the verification script:

```bash
# For Fuji
export NETWORK=fuji
forge script script/Verify.s.sol:Verify --rpc-url $AVALANCHE_FUJI_RPC_URL -vvvv

# For Mainnet
export NETWORK=mainnet
forge script script/Verify.s.sol:Verify --rpc-url $AVALANCHE_MAINNET_RPC_URL -vvvv
```

## Deployment Flow

1. **Configuration**
   - Load environment variables
   - Set up network configuration
   - Validate environment

2. **Deployment**
   - Deploy contracts in correct order
   - Configure contract relationships
   - Set up initial parameters

3. **Verification**
   - Generate verification commands
   - Save deployment information
   - Provide next steps

## Best Practices

1. Always test deployments on a local network first
2. Verify all contract interactions after deployment
3. Keep your private keys secure
4. Save deployment artifacts for future reference
5. Use different wallets for testnet and mainnet deployments

## Troubleshooting

- **Insufficient funds**: Ensure your deployer wallet has enough AVAX for gas
- **Network issues**: Check your RPC URL and network connection
- **Verification failures**: Double-check constructor arguments and contract addresses
- **Gas estimation errors**: Try increasing the gas limit or gas price

For more information, refer to the [Foundry documentation](https://book.getfoundry.sh/).
