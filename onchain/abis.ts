// Minimal ABIs for the testnet market contracts
// (proptoken-autonomous/contracts/src/testnet and src/tokens).
import { parseAbi } from 'viem';

export const testUsdAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function faucet()',
  'function nextFaucetTime(address account) view returns (uint256)',
  'function FAUCET_AMOUNT() view returns (uint256)',
]);

export const propTokenAbi = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function verifiedInvestors(address investor) view returns (bool)',
  'function frozenWallets(address wallet) view returns (bool)',
]);

export const marketAbi = parseAbi([
  'function buy(address token, uint256 amount) returns (uint256 cost)',
  'function sell(address token, uint256 amount) returns (uint256 payout)',
  'function priceOf(address token) view returns (uint256)',
  'function sellSpreadBps() view returns (uint16)',
  'function reserve() view returns (uint256)',
  'event Bought(address indexed buyer, address indexed token, uint256 amount, uint256 cost)',
  'event Sold(address indexed seller, address indexed token, uint256 amount, uint256 payout)',
]);

export const USD_DECIMALS = 6;
export const TOKEN_DECIMALS = 18;
