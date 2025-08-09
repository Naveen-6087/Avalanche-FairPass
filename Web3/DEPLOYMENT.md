# Avalanche FairPass Deployment Guide

This guide provides comprehensive instructions for deploying the Avalanche FairPass smart contracts to various networks.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Environment Setup](#environment-setup)
4. [Local Development](#local-development)
5. [Testnet Deployment](#testnet-deployment)
6. [Mainnet Deployment](#mainnet-deployment)
7. [Contract Verification](#contract-verification)
8. [Post-Deployment Setup](#post-deployment-setup)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- [Foundry](https://getfoundry.sh/) installed
- Node.js and npm (for additional tooling)
- Git
- A wallet with sufficient funds for deployment
- Access to required RPC endpoints
- Block explorer API keys (for contract verification)

## Project Overview

The Avalanche FairPass project consists of three main smart contracts:

1. **EventContract** (`EventContract.sol`) - ERC721 NFT contract for event tickets
2. **EventManager** (`EventManager.sol`) - Manages event creation and ticket minting
3. **Marketplace** (`Marketplace.sol`) - Facilitates ticket trading with royalty support

### Contract Dependencies

```
EventManager → EventContract
Marketplace → EventContract
```

The deployment order is: EventContract → EventManager → Marketplace

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Avalanche-FairPass/Web3
make install
```

### 2. Environment Configuration

Create a `.env` file in the Web3 directory:

```bash
make setup-env
```

Edit the `.env` file with your configuration:

```env
# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# API Keys for contract verification
SNOWTRACE_API_KEY=your_snowtrace_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Deployment Configuration
CONTRACT_OWNER=0x...  # Address that will own EventContract and EventManager
MARKETPLACE_OWNER=0x... # Address that will own Marketplace
MARKETPLACE_FEE=250     # Marketplace fee in basis points (250 = 2.5%)
VERIFY_CONTRACTS=true   # Enable contract verification
```

### 3. Verify Installation

```bash
make build
make test
```

## Local Development

### Start Local Network

```bash
make deploy-local
```

This command will:
- Start an Anvil local network
- Deploy all contracts
- Create sample events for testing
- Keep Anvil running in the background

### Stop Local Network

```bash
make stop-anvil
```

### Local Development Features

- Pre-funded accounts
- Sample events created automatically
- No gas costs or verification needed
- Fast transaction times

## Testnet Deployment

### Avalanche Fuji Testnet

1. **Get Test AVAX**
   - Visit [Avalanche Faucet](https://faucet.avax.network/)
   - Request test AVAX for your deployer address

2. **Deploy to Fuji**
   ```bash
   make deploy-avalanche-fuji
   ```

3. **Verify Deployment**
   - Check [Fuji Explorer](https://testnet.snowtrace.io/)
   - Verify contract functionality

### Other Testnets

The deployment scripts support multiple testnets. Update your `.env` file with the appropriate RPC URLs and run:

```bash
# Ethereum Sepolia
forge script script/Deploy.s.sol:DeployScript --rpc-url ${ETHEREUM_SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify

# Polygon Mumbai
forge script script/Deploy.s.sol:DeployScript --rpc-url ${POLYGON_MUMBAI_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify
```

## Mainnet Deployment

⚠️ **WARNING: Mainnet deployment uses real funds. Double-check all configurations.**

### Pre-Deployment Checklist

- [ ] All contracts tested on testnet
- [ ] Environment variables properly configured
- [ ] Sufficient AVAX balance for deployment
- [ ] Owner addresses confirmed
- [ ] Marketplace fee settings verified

### Deploy to Avalanche Mainnet

```bash
make deploy-avalanche-main
```

The script will:
1. Prompt for confirmation (type `DEPLOY` to proceed)
2. Validate environment and balances
3. Deploy contracts in correct order
4. Configure marketplace settings
5. Verify contracts automatically
6. Save deployment information

### Manual Mainnet Deployment

For more control, use the forge command directly:

```bash
forge script script/DeployAvalanche.s.sol:DeployAvalancheScript \
  --rpc-url ${AVALANCHE_MAINNET_RPC_URL} \
  --private-key ${PRIVATE_KEY} \
  --broadcast \
  --verify \
  -vvvv
```

## Contract Verification

### Automatic Verification

Verification happens automatically during deployment if:
- `VERIFY_CONTRACTS=true` in `.env`
- Appropriate API key is set
- Network supports verification

### Manual Verification

If automatic verification fails, use the verification helper:

```bash
forge script script/Verify.s.sol:VerifyScript --rpc-url <RPC_URL>
```

This will output the exact verification commands to run.

### Example Verification Commands

```bash
# EventContract
forge verify-contract <CONTRACT_ADDRESS> \
  src/EventContract.sol:EventContract \
  --chain avalanche \
  --etherscan-api-key $SNOWTRACE_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" <OWNER_ADDRESS>)

# EventManager
forge verify-contract <CONTRACT_ADDRESS> \
  src/EventManager.sol:EventManager \
  --chain avalanche \
  --etherscan-api-key $SNOWTRACE_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address)" <OWNER_ADDRESS> <EVENTCONTRACT_ADDRESS>)

# Marketplace
forge verify-contract <CONTRACT_ADDRESS> \
  src/Marketplace.sol:Marketplace \
  --chain avalanche \
  --etherscan-api-key $SNOWTRACE_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address)" <EVENTCONTRACT_ADDRESS> <OWNER_ADDRESS>)
```

## Post-Deployment Setup

### 1. Verify Contract Ownership

```bash
# Check EventContract owner
cast call <EVENTCONTRACT_ADDRESS> "owner()" --rpc-url <RPC_URL>

# Check EventManager owner
cast call <EVENTMANAGER_ADDRESS> "owner()" --rpc-url <RPC_URL>

# Check Marketplace owner
cast call <MARKETPLACE_ADDRESS> "owner()" --rpc-url <RPC_URL>
```

### 2. Test Basic Functionality

```bash
# Create a test event
cast send <EVENTMANAGER_ADDRESS> \
  "createEvent(string,string,string,uint256)" \
  "Test Event" "Virtual" "2024-12-01" 100000000000000000 \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>

# Check event details
cast call <EVENTMANAGER_ADDRESS> \
  "getEventDetails(uint256)" 0 \
  --rpc-url <RPC_URL>
```

### 3. Configure Marketplace (Optional)

```bash
# Update marketplace fee (if needed)
cast send <MARKETPLACE_ADDRESS> \
  "updateMarketplaceFee(uint256)" 300 \
  --rpc-url <RPC_URL> --private-key <OWNER_PRIVATE_KEY>
```

### 4. Transfer Ownership (If Needed)

```bash
# Transfer EventContract ownership
cast send <EVENTCONTRACT_ADDRESS> \
  "transferOwnership(address)" <NEW_OWNER> \
  --rpc-url <RPC_URL> --private-key <CURRENT_OWNER_KEY>
```

## Deployment Scripts Reference

- `Deploy.s.sol` - Base deployment script for all networks
- `DeployLocal.s.sol` - Local Anvil network deployment with test data
- `DeployAvalanche.s.sol` - Avalanche-specific deployment with network validation
- `Config.s.sol` - Network configuration management
- `Verify.s.sol` - Contract verification helper

## Network Information

### Avalanche Mainnet
- **Chain ID**: 43114
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Explorer**: https://snowtrace.io/
- **Gas Token**: AVAX

### Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://faucet.avax.network/

## Deployment Costs (Estimates)

| Network | Contract Deployment | Total Cost |
|---------|-------------------|------------|
| Avalanche Mainnet | ~0.05 AVAX | ~0.15 AVAX |
| Avalanche Fuji | ~0.05 AVAX | ~0.15 AVAX |
| Ethereum Mainnet | ~0.02 ETH | ~0.06 ETH |

*Costs vary based on network congestion and gas prices*

## Security Considerations

1. **Private Key Management**
   - Never commit private keys to version control
   - Use hardware wallets for mainnet deployments
   - Consider using multi-sig wallets for contract ownership

2. **Owner Address Verification**
   - Double-check all owner addresses before deployment
   - Ensure owner addresses are accessible
   - Consider immediate ownership transfer if deploying with temporary keys

3. **Contract Parameters**
   - Verify marketplace fee settings
   - Confirm royalty percentages
   - Test all configurations on testnet first

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   Error: insufficient funds for gas * price + value
   ```
   **Solution**: Add more funds to the deployer address

2. **RPC Connection Issues**
   ```
   Error: could not connect to RPC
   ```
   **Solution**: Check RPC URL and network connectivity

3. **Verification Failures**
   ```
   Error: contract verification failed
   ```
   **Solution**: Check API key and retry with manual verification

4. **Contract Already Deployed**
   ```
   Error: contract creation code storage out of gas
   ```
   **Solution**: Check if contracts already exist at computed addresses

### Debug Commands

```bash
# Check account balance
cast balance <ADDRESS> --rpc-url <RPC_URL>

# Check nonce
cast nonce <ADDRESS> --rpc-url <RPC_URL>

# Test RPC connection
cast block-number --rpc-url <RPC_URL>

# Estimate gas
cast estimate <CONTRACT_ADDRESS> <FUNCTION_SIG> <ARGS> --rpc-url <RPC_URL>
```

### Getting Help

1. Check the [Foundry Book](https://book.getfoundry.sh/)
2. Review contract tests for usage examples
3. Consult Avalanche documentation
4. Check block explorer for transaction details

## Useful Make Commands

```bash
make help                    # Show all available commands
make install                 # Install dependencies
make build                   # Build contracts
make test                    # Run tests
make deploy-local           # Deploy to local network
make deploy-avalanche-fuji  # Deploy to Fuji testnet
make deploy-avalanche-main  # Deploy to Avalanche mainnet
make clean                  # Clean build artifacts
make get-deployment         # Show recent deployment files
```

## Example Deployment Output

```
=== Avalanche Deployment Configuration ===
Network: Avalanche Mainnet
Chain ID: 43114
Deployer: 0x742d35Cc6634C0532925a3b8D4d6FA1e56C2f2aA
Contract Owner: 0x742d35Cc6634C0532925a3b8D4d6FA1e56C2f2aA
Marketplace Owner: 0x742d35Cc6634C0532925a3b8D4d6FA1e56C2f2aA
Marketplace Fee (bps): 250
Verify Contracts: true
==========================================

--- Deploying EventContract ---
EventContract deployed to: 0x1234567890123456789012345678901234567890

--- Deploying EventManager ---
EventManager deployed to: 0x2345678901234567890123456789012345678901

--- Deploying Marketplace ---
Marketplace deployed to: 0x3456789012345678901234567890123456789012

=== Deployment Summary ===
EventContract: 0x1234567890123456789012345678901234567890
EventManager: 0x2345678901234567890123456789012345678901
Marketplace: 0x3456789012345678901234567890123456789012
==========================
```

---

For additional support or questions, please refer to the project documentation or open an issue in the repository.
