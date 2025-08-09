# Avalanche FairPass Deployment Makefile
.PHONY: help install build test deploy-local deploy-avalanche-fuji deploy-avalanche-mainnet clean verify

# Default target
help:
	@echo "Avalanche FairPass Deployment Commands"
	@echo "======================================"
	@echo "install                 - Install dependencies"
	@echo "build                   - Build contracts"
	@echo "test                    - Run tests"
	@echo "deploy-local           - Deploy to local Anvil network"
	@echo "deploy-avalanche-fuji  - Deploy to Avalanche Fuji testnet"
	@echo "deploy-avalanche-main  - Deploy to Avalanche mainnet"
	@echo "verify-avalanche       - Verify contracts on Snowtrace"
	@echo "clean                  - Clean build artifacts"
	@echo ""
	@echo "Environment Setup:"
	@echo "- Copy .env.example to .env and configure"
	@echo "- Set PRIVATE_KEY, RPC URLs, and API keys"

# Install dependencies
install:
	@echo "Installing Foundry dependencies..."
	forge install

# Build contracts
build:
	@echo "Building contracts..."
	forge build

# Run tests
test:
	@echo "Running tests..."
	forge test -vv

# Deploy to local Anvil network
deploy-local:
	@echo "Starting local Anvil network..."
	@anvil --detach --port 8545 &
	@sleep 2
	@echo "Deploying to local network..."
	forge script script/DeployLocal.s.sol:DeployLocalScript --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast -vvvv
	@echo "Local deployment completed!"
	@echo "Anvil is running in the background. Kill with: pkill -f anvil"

# Deploy to Avalanche Fuji testnet
deploy-avalanche-fuji:
	@echo "Deploying to Avalanche Fuji testnet..."
	@if [ ! -f .env ]; then echo "Error: .env file not found. Copy .env.example to .env and configure."; exit 1; fi
	forge script script/DeployAvalanche.s.sol:DeployAvalancheScript --rpc-url ${AVALANCHE_FUJI_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify -vvvv
	@echo "Fuji deployment completed!"

# Deploy to Avalanche mainnet
deploy-avalanche-main:
	@echo "WARNING: Deploying to Avalanche MAINNET!"
	@echo "This will use real AVAX. Are you sure? (Press Ctrl+C to cancel)"
	@read -p "Type 'DEPLOY' to continue: " confirm && [ "$$confirm" = "DEPLOY" ]
	@echo "Deploying to Avalanche mainnet..."
	@if [ ! -f .env ]; then echo "Error: .env file not found. Copy .env.example to .env and configure."; exit 1; fi
	forge script script/DeployAvalanche.s.sol:DeployAvalancheScript --rpc-url ${AVALANCHE_MAINNET_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify -vvvv
	@echo "Mainnet deployment completed!"

# Verify contracts on Snowtrace (for manual verification)
verify-avalanche:
	@echo "Verifying contracts on Snowtrace..."
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then echo "Usage: make verify-avalanche CONTRACT_ADDRESS=<address> CONTRACT_NAME=<name>"; exit 1; fi
	@if [ -z "$(CONTRACT_NAME)" ]; then echo "Usage: make verify-avalanche CONTRACT_ADDRESS=<address> CONTRACT_NAME=<name>"; exit 1; fi
	forge verify-contract $(CONTRACT_ADDRESS) src/$(CONTRACT_NAME).sol:$(CONTRACT_NAME) --chain avalanche-fuji --etherscan-api-key ${SNOWTRACE_API_KEY}

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	forge clean
	rm -rf deployment-*.json
	rm -rf avalanche-deployment-*.json

# Development helpers
start-anvil:
	@echo "Starting Anvil local network..."
	anvil --port 8545

stop-anvil:
	@echo "Stopping Anvil..."
	pkill -f anvil || true

# Contract interactions (examples)
create-event:
	@echo "Creating test event..."
	@if [ -z "$(EVENT_MANAGER)" ]; then echo "Usage: make create-event EVENT_MANAGER=<address>"; exit 1; fi
	cast send $(EVENT_MANAGER) "createEvent(string,string,string,uint256)" "Test Event" "Virtual" "2024-12-01" 100000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

mint-ticket:
	@echo "Minting test ticket..."
	@if [ -z "$(EVENT_MANAGER)" ]; then echo "Usage: make mint-ticket EVENT_MANAGER=<address> EVENT_ID=<id> TO=<address>"; exit 1; fi
	@if [ -z "$(EVENT_ID)" ]; then echo "Usage: make mint-ticket EVENT_MANAGER=<address> EVENT_ID=<id> TO=<address>"; exit 1; fi
	@if [ -z "$(TO)" ]; then echo "Usage: make mint-ticket EVENT_MANAGER=<address> EVENT_ID=<id> TO=<address>"; exit 1; fi
	cast send $(EVENT_MANAGER) "mintTicket(uint256,address,string,uint256)" $(EVENT_ID) $(TO) "ipfs://test-uri" $$(date -d "+30 days" +%s) --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Get deployment info
get-deployment:
	@echo "Latest deployment files:"
	@ls -la deployment-*.json avalanche-deployment-*.json 2>/dev/null || echo "No deployment files found"

# Environment setup
setup-env:
	@if [ ! -f .env ]; then \
		echo "Creating .env file from template..."; \
		echo "# Avalanche FairPass Deployment Configuration" > .env; \
		echo "# Fill in your values below" >> .env; \
		echo "" >> .env; \
		echo "PRIVATE_KEY=your_private_key_here" >> .env; \
		echo "AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc" >> .env; \
		echo "AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc" >> .env; \
		echo "SNOWTRACE_API_KEY=your_snowtrace_api_key" >> .env; \
		echo "CONTRACT_OWNER=" >> .env; \
		echo "MARKETPLACE_OWNER=" >> .env; \
		echo "MARKETPLACE_FEE=250" >> .env; \
		echo "VERIFY_CONTRACTS=true" >> .env; \
		echo ".env file created! Please edit it with your values."; \
	else \
		echo ".env file already exists"; \
	fi


