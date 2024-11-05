import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import * as allWagmiChains from 'wagmi/chains'
import { http } from "viem";

if (!process.env.NEXT_PUBLIC_EVM_CHAIN_ID)
  throw new Error("NEXT_PUBLIC_EVM_CHAIN_ID must be set");

if (!process.env.NEXT_PUBLIC_EVM_RPC_URL)
  throw new Error("NEXT_PUBLIC_EVM_RPC_URL must be set");

const chainId = parseInt(process.env.NEXT_PUBLIC_EVM_CHAIN_ID!);
const chain =  Object.values(allWagmiChains)
  .find(chain => chain.id === chainId);

if (!chain)
  throw new Error("Invalid NEXT_PUBLIC_EVM_CHAIN_ID " + chainId);

const wagmiConfig = getDefaultConfig({
  appName: 'DistriBrain',
  projectId: '98e3a178b58e7a726f08e22381be14a6',
  chains: [chain],
  transports: {
    [chain.id]: http(process.env.NEXT_PUBLIC_EVM_RPC_URL),
  },
  ssr: true
})

const config = {
  chain: chain,
  chains: [chain],
  config: wagmiConfig
}

export default config;
