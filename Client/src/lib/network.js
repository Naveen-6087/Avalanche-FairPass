import CONTRACTS from '../constants/constants';

export async function getCurrentChainId() {
  if (!window.ethereum) return null;
  const hexId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(hexId, 16);
}

export async function switchToFuji() {
  if (!window.ethereum) throw new Error('No wallet found');
  const chainIdHex = '0x' + CONTRACTS.NETWORK.chainId.toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: CONTRACTS.NETWORK.name,
          rpcUrls: [CONTRACTS.NETWORK.rpcUrl],
          nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
          blockExplorerUrls: [CONTRACTS.NETWORK.explorerUrl],
        }],
      });
    } else {
      throw switchError;
    }
  }
}
