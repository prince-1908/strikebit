import React, { ReactNode } from "react";
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import wagmiConfig from "@/providers/web3/wagmiConfig";

const queryClient = new QueryClient();

export const Web3WalletProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  return (
    <WagmiProvider config={wagmiConfig.config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={true}
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#7f53cf",
            borderRadius: 'small',
            overlayBlur: 'small'
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
