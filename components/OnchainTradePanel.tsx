import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits } from 'viem';
import { AlertTriangle, CheckCircle2, Droplets, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { useOnchainMarket } from '../hooks/useOnchainMarket';
import { ETH_FAUCET_URL, addressUrl, deployment, txUrl } from '../onchain/deployment';
import { TOKEN_DECIMALS, USD_DECIMALS } from '../onchain/abis';

interface OnchainTradePanelProps {
  assetId: string;
  mode: 'buy' | 'sell';
}

const fmtUsd = (v: bigint) => Number(formatUnits(v, USD_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });
const fmtToken = (v: bigint) => Number(formatUnits(v, TOKEN_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 4 });
const shortHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-6)}`;

/**
 * Buy or sell one asset's token on the Base Sepolia testnet market with the
 * connected wallet. Every action is a real testnet transaction.
 */
export const OnchainTradePanel: React.FC<OnchainTradePanelProps> = ({ assetId, mode }) => {
  const m = useOnchainMarket(assetId);
  const [amountText, setAmountText] = useState('1');

  if (!m.available) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-sm text-slate-500">
        This asset is not listed on the Base Sepolia market.
      </div>
    );
  }

  const symbol = m.asset!.symbol;
  const amount = m.parseAmount(amountText);
  const cost = m.quoteBuy(amount);
  const payout = m.quoteSell(amount);
  const faucetWait = m.nextFaucetTime > 0 ? new Date(m.nextFaucetTime * 1000) : null;

  let blocker: string | null = null;
  if (amount === 0n) blocker = 'Enter an amount';
  else if (m.frozen) blocker = 'This wallet is frozen for this token';
  else if (m.ethBalance === 0n) blocker = 'You need a little Base Sepolia ETH for gas';
  else if (mode === 'buy' && cost === 0n) blocker = 'Amount too small';
  else if (mode === 'buy' && cost > m.usdBalance) blocker = 'Not enough test USD';
  else if (mode === 'sell' && amount > m.tokenBalance) blocker = `You own ${fmtToken(m.tokenBalance)} ${symbol}`;
  else if (mode === 'sell' && payout > m.reserve) blocker = 'Market reserve too low';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{mode === 'buy' ? 'Buy' : 'Sell'} {symbol}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Base Sepolia testnet · no real value</p>
        </div>
        <a href={addressUrl(deployment!.market)} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
          Market <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {!m.isConnected ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Connect a wallet to trade on Base Sepolia.</p>
          <ConnectButton />
        </div>
      ) : !m.onBaseSepolia ? (
        <button
          onClick={m.switchToBaseSepolia}
          disabled={m.isSwitching}
          className="w-full py-3 rounded-lg font-black uppercase tracking-widest text-xs bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {m.isSwitching ? 'Switching…' : 'Switch wallet to Base Sepolia'}
        </button>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <div className="text-sm font-black">{fmtUsd(m.usdBalance)}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">tUSD</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <div className="text-sm font-black">{fmtToken(m.tokenBalance)}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{symbol}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <div className="text-sm font-black">{Number(formatUnits(m.ethBalance, 18)).toFixed(4)}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">ETH (gas)</div>
            </div>
          </div>

          {m.ethBalance === 0n && !m.loading && (
            <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>
                Transactions need a little Base Sepolia ETH for gas.{' '}
                <a href={ETH_FAUCET_URL} target="_blank" rel="noreferrer" className="underline font-bold">Get some from a faucet</a>.
              </span>
            </div>
          )}

          {mode === 'buy' && (
            <button
              onClick={m.faucet}
              disabled={m.busy || faucetWait !== null}
              className="w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-900 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Droplets className="w-4 h-4" />
              {faucetWait ? `Next test USD at ${faucetWait.toLocaleTimeString()}` : 'Get 10,000 test USD'}
            </button>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount ({symbol})</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amountText}
              onChange={e => setAmountText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-lg px-4 py-2 font-black outline-none focus:border-indigo-600"
            />
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Price {fmtUsd(m.price)} tUSD / token</span>
              <span className="font-black">
                {mode === 'buy' ? `Cost ${fmtUsd(cost)} tUSD` : `You get ${fmtUsd(payout)} tUSD`}
              </span>
            </div>
            {mode === 'sell' && (
              <p className="text-[10px] text-slate-400">Instant buyback from the market reserve, minus a {m.spreadBps / 100}% spread.</p>
            )}
          </div>

          <button
            onClick={() => (mode === 'buy' ? m.buy(amountText) : m.sell(amountText))}
            disabled={m.busy || blocker !== null}
            className="w-full py-3 rounded-lg font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700"
          >
            {m.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {m.busy ? 'Waiting for wallet…' : blocker ?? `${mode === 'buy' ? 'Buy' : 'Sell'} ${amountText} ${symbol}`}
          </button>

          {mode === 'buy' && (
            <p className="text-[10px] text-slate-400">
              Your first purchase also whitelists your wallet for this token (a testnet stand-in for KYC).
            </p>
          )}
        </>
      )}

      {m.step && <p className="text-xs font-bold text-indigo-600">{m.step}</p>}
      {m.error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{m.error}</span>
        </div>
      )}
      {m.readError && <p className="text-[11px] text-red-500">Could not read from Base Sepolia: {m.readError}</p>}

      {m.txs.length > 0 && (
        <ul className="space-y-1">
          {m.txs.map(tx => (
            <li key={tx.hash} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                {tx.status === 'pending' && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
                {tx.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {tx.status === 'reverted' && <XCircle className="w-3 h-3 text-red-600" />}
                {tx.label}
              </span>
              <a href={txUrl(tx.hash)} target="_blank" rel="noreferrer" className="font-mono text-indigo-600 hover:underline flex items-center gap-1">
                {shortHash(tx.hash)} <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
