if (!process.env.NEXT_PUBLIC_EVM_BLOCK_EXPLORER_TRANSACTION_HASH_TEMPLATE)
  throw new Error("NEXT_PUBLIC_EVM_BLOCK_EXPLORER_TRANSACTION_HASH_TEMPLATE must be set")

if (!process.env.NEXT_PUBLIC_EVM_BLOCK_EXPLORER_ADDRESS_TEMPLATE)
  throw new Error("NEXT_PUBLIC_EVM_BLOCK_EXPLORER_ADDRESS_TEMPLATE must be set")

export const routes = {
  makeAbsoluteUri: (relativeUri: string) => window.location.protocol + "//" + window.location.host + relativeUri,

  auth: {
    login: (returnToUrl: string) => `/api/auth/login?returnTo=${encodeURIComponent(returnToUrl)}`,
    logout: () => `/api/auth/logout`,
  },

  home: () => "/",
  login: () => "/login",

  legal: {
    termsAndConditions: () => "https://distribrain.gitbook.io/distribrain-1",
    privacyPolicy: () => "https://distribrain.gitbook.io/distribrain-1/privacy-policy",
    support: () => "mailto:support@distribrain.ai?subject=DistriBrain%20Engines%20Support",
  },

  docs: {
    dePinKey: () => "https://distribrain.gitbook.io/distribrain/depin/depin-key"
  },

  referralLink: (referralCode: string) => routes.makeAbsoluteUri(`/?eref=${encodeURIComponent(referralCode)}`),

  evmBlockExplorer: {
    transaction: (transactionHash: string) =>
      process.env.NEXT_PUBLIC_EVM_BLOCK_EXPLORER_TRANSACTION_HASH_TEMPLATE!
        .replace("{txId}", transactionHash),
    address: (address: string) =>
      process.env.NEXT_PUBLIC_EVM_BLOCK_EXPLORER_ADDRESS_TEMPLATE!
        .replace("{address}", address)
  }
};
