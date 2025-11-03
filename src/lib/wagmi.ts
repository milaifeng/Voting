import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
export const config = getDefaultConfig({
 appName: 'Voting',
  projectId: '0dea49cf8446f4b4f72c33be9ade22c8',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia
  ],
  ssr: true,
});



 