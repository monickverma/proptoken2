
import { Asset, Wallet } from './types';

export const DUMMY_ASSETS: Asset[] = [
  {
    id: 'ASSET-GGM-001',
    name: 'DLF Cyber Hub',
    location: 'DLF Cyber City, Phase 2, Gurugram',
    yieldPercent: 11.5,
    tokenPrice: 5000,
    totalTokens: 1000000,
    image: 'https://static-maps.yandex.ru/1.x/?lang=en_US&ll=77.0895421,28.4949762&z=17&l=sat&size=600,450',
    risk: 'Low'
  },
  {
    id: 'ASSET-GGM-002',
    name: 'One Horizon Center',
    location: 'Golf Course Road, Sector 43, Gurugram',
    yieldPercent: 12.8,
    tokenPrice: 12000,
    totalTokens: 2500000,
    image: 'https://static-maps.yandex.ru/1.x/?lang=en_US&ll=77.096463,28.450929&z=17&l=sat&size=600,450',
    risk: 'Medium'
  },
  {
    id: 'ASSET-GGM-003',
    name: 'Ambience Mall Complex',
    location: 'NH-8, Ambience Island, Gurugram',
    yieldPercent: 10.2,
    tokenPrice: 2500,
    totalTokens: 5000000,
    image: 'https://static-maps.yandex.ru/1.x/?lang=en_US&ll=77.09679,28.50418&z=17&l=sat&size=600,450',
    risk: 'Low'
  },
  {
    id: 'ASSET-GGM-004',
    name: 'Worldmark Gurugram',
    location: 'Sector 65, Gurugram',
    yieldPercent: 11.0,
    tokenPrice: 4500,
    totalTokens: 1500000,
    image: 'https://static-maps.yandex.ru/1.x/?lang=en_US&ll=77.071944,28.397722&z=17&l=sat&size=600,450',
    risk: 'Medium'
  },
  {
    id: 'ASSET-GGM-005',
    name: 'Candor TechSpace',
    location: 'Sector 48, Sohna Road, Gurugram',
    yieldPercent: 10.5,
    tokenPrice: 3500,
    totalTokens: 3000000,
    image: 'https://static-maps.yandex.ru/1.x/?lang=en_US&ll=77.03126,28.42534&z=17&l=sat&size=600,450',
    risk: 'Low'
  }
];

export const INITIAL_WALLET: Wallet = {
  tokensByAsset: {
    'ASSET-GGM-001': 50,
    'ASSET-GGM-002': 0,
    'ASSET-GGM-003': 10,
  },
  totalInvested: 370000,
  stablecoinBalance: 150000,
  lockedCollateral: 0,
  history: [
    { id: '1', type: 'BUY_TOKENS', description: 'Bought 50 tokens of Emerald Meadows', timestamp: '2024-05-10T14:30:00Z', amount: '₹2,50,000' },
    { id: '2', type: 'VERIFY', description: 'Verified asset Royal Palm Grove', timestamp: '2024-05-11T10:15:00Z' }
  ],
  network: 'Polygon Mainnet'
};
