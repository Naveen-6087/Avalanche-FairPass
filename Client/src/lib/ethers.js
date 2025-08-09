import { ethers } from 'ethers';
import CONTRACTS from '../constants/constants';

export function getProvider() {
  if (!window.ethereum) throw new Error('No injected provider found. Install MetaMask or a compatible wallet.');
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

export function getAddressBy(name) {
  const addr = CONTRACTS?.ADDRESSES?.[name];
  if (!addr) throw new Error(`Unknown contract key: ${name}`);
  return addr;
}

export function getAbiBy(name) {
  const abi = CONTRACTS?.ABI?.[name];
  if (!abi) throw new Error(`Unknown ABI key: ${name}`);
  return abi;
}

export async function getContractBy(name, readOnly = false) {
  const address = getAddressBy(name);
  const abi = getAbiBy(name);
  if (readOnly) {
    const provider = getProvider();
    return new ethers.Contract(address, abi, provider);
  }
  const signer = await getSigner();
  return new ethers.Contract(address, abi, signer);
}
