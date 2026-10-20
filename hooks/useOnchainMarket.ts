import { useState } from 'react';
import { useAccount, useBalance, usePublicClient, useReadContracts, useSwitchChain, useWriteContract } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { BaseError, UserRejectedRequestError, parseUnits, type Abi, type Address, type Hash } from 'viem';
import { deployment, onchainAsset } from '../onchain/deployment';
import { marketAbi, propTokenAbi, testUsdAbi, TOKEN_DECIMALS } from '../onchain/abis';

export interface TxRecord {
  label: string;
  hash: Hash;
  status: 'pending' | 'success' | 'reverted';
}

const ZERO = '0x0000000000000000000000000000000000000000' as Address;

function friendlyError(err: unknown): string {
  if (err instanceof BaseError) {
    if (err.walk(e => e instanceof UserRejectedRequestError)) return 'You rejected the request in your wallet.';
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : String(err);
}

/**
 * Reads balances and sends faucet / buy / sell transactions to the
 * PropTokenMarket on Base Sepolia for one asset.
 */
export function useOnchainMarket(assetId: string) {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });
  const { writeContractAsync } = useWriteContract();

  const asset = onchainAsset(assetId);
  const onBaseSepolia = chainId === baseSepolia.id;
  const user = address ?? ZERO;
  const market = deployment?.market ?? ZERO;
  const usd = deployment?.testUsd ?? ZERO;
  const token = asset?.token ?? ZERO;

  const reads = useReadContracts({
    contracts: [
      { address: usd, abi: testUsdAbi, functionName: 'balanceOf', args: [user], chainId: baseSepolia.id },
      { address: usd, abi: testUsdAbi, functionName: 'nextFaucetTime', args: [user], chainId: baseSepolia.id },
      { address: usd, abi: testUsdAbi, functionName: 'allowance', args: [user, market], chainId: baseSepolia.id },
      { address: token, abi: propTokenAbi, functionName: 'balanceOf', args: [user], chainId: baseSepolia.id },
      { address: token, abi: propTokenAbi, functionName: 'allowance', args: [user, market], chainId: baseSepolia.id },
      { address: token, abi: propTokenAbi, functionName: 'frozenWallets', args: [user], chainId: baseSepolia.id },
      { address: market, abi: marketAbi, functionName: 'priceOf', args: [token], chainId: baseSepolia.id },
      { address: market, abi: marketAbi, functionName: 'sellSpreadBps', chainId: baseSepolia.id },
      { address: market, abi: marketAbi, functionName: 'reserve', chainId: baseSepolia.id },
    ],
    allowFailure: false,
    query: { enabled: Boolean(deployment && asset && address), refetchInterval: 15_000 },
  });
  const eth = useBalance({ address, chainId: baseSepolia.id, query: { enabled: Boolean(address) } });

  const [usdBalance, nextFaucetTime, usdAllowance, tokenBalance, tokenAllowance, frozen, price, spreadBps, reserve] =
    reads.data ?? [0n, 0n, 0n, 0n, 0n, false, 0n, 0, 0n];

  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = step !== null;

  const quoteBuy = (amount: bigint) => (amount * price) / 10n ** BigInt(TOKEN_DECIMALS);
  const quoteSell = (amount: bigint) => (quoteBuy(amount) * (10_000n - BigInt(spreadBps))) / 10_000n;

  async function send(label: string, request: { address: Address; abi: Abi; functionName: string; args?: readonly unknown[] }) {
    const hash = await writeContractAsync({ ...request, chainId: baseSepolia.id } as Parameters<typeof writeContractAsync>[0]);
    setTxs(prev => [{ label, hash, status: 'pending' }, ...prev]);
    const receipt = await publicClient!.waitForTransactionReceipt({ hash });
    const status = receipt.status === 'success' ? 'success' : 'reverted';
    setTxs(prev => prev.map(t => (t.hash === hash ? { ...t, status } : t)));
    if (status !== 'success') throw new Error(`${label} reverted on-chain.`);
  }

  async function run(steps: () => Promise<void>) {
    setError(null);
    try {
      await steps();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setStep(null);
      reads.refetch();
      eth.refetch();
    }
  }

  const parseAmount = (value: string) => {
    try {
      return parseUnits(value || '0', TOKEN_DECIMALS);
    } catch {
      return 0n;
    }
  };

  const faucet = () =>
    run(async () => {
      setStep('Confirm the faucet claim in your wallet');
      await send('Get test USD', { address: usd, abi: testUsdAbi, functionName: 'faucet' });
    });

  const buy = (amountText: string) =>
    run(async () => {
      const amount = parseAmount(amountText);
      const cost = quoteBuy(amount);
      const needsApproval = usdAllowance < cost;
      if (needsApproval) {
        setStep('Step 1 of 2: approve tUSD spending in your wallet');
        await send('Approve tUSD', { address: usd, abi: testUsdAbi, functionName: 'approve', args: [market, cost] });
      }
      setStep(needsApproval ? 'Step 2 of 2: confirm the purchase in your wallet' : 'Confirm the purchase in your wallet');
      await send(`Buy ${amountText} ${asset!.symbol}`, { address: market, abi: marketAbi, functionName: 'buy', args: [token, amount] });
    });

  const sell = (amountText: string) =>
    run(async () => {
      const amount = parseAmount(amountText);
      const needsApproval = tokenAllowance < amount;
      if (needsApproval) {
        setStep(`Step 1 of 2: approve ${asset!.symbol} in your wallet`);
        await send(`Approve ${asset!.symbol}`, { address: token, abi: propTokenAbi, functionName: 'approve', args: [market, amount] });
      }
      setStep(needsApproval ? 'Step 2 of 2: confirm the sale in your wallet' : 'Confirm the sale in your wallet');
      await send(`Sell ${amountText} ${asset!.symbol}`, { address: market, abi: marketAbi, functionName: 'sell', args: [token, amount] });
    });

  return {
    available: Boolean(deployment && asset),
    asset,
    address,
    isConnected,
    onBaseSepolia,
    isSwitching,
    switchToBaseSepolia: () => switchChain({ chainId: baseSepolia.id }),
    loading: reads.isLoading,
    readError: reads.error ? friendlyError(reads.error) : null,
    usdBalance,
    nextFaucetTime: Number(nextFaucetTime),
    tokenBalance,
    frozen,
    price,
    spreadBps: Number(spreadBps),
    reserve,
    ethBalance: eth.data?.value ?? 0n,
    parseAmount,
    quoteBuy,
    quoteSell,
    faucet,
    buy,
    sell,
    busy,
    step,
    error,
    txs,
  };
}
