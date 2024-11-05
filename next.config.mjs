/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config) => {
    // camel-case style names from css modules
    // https://github.com/vercel/next.js/discussions/11267
    config.module.rules
        .find(({oneOf}) => !!oneOf).oneOf
        .filter(({use}) => JSON.stringify(use)?.includes('css-loader'))
        .reduce((acc, {use}) => acc.concat(use), [])
        .forEach(({options}) => {
          if (options.modules) {
            options.modules.exportLocalsConvention = 'camelCase';
          }
        });

    return {
      ...config,
    };
  },
};

export default nextConfig;
