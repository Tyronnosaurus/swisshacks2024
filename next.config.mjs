/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return([
            {
                source: "/sign-in",
                destination: "/api/auth/login",
                permanent: true
            },
            {
                source: "/sign-up",
                destination: "/api/auth/sign-up",
                permanent: true
            }
        ]);
    },

    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'gravatar.com',
            pathname: '**',
          },
        ],
      },

    webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    
        config.resolve.alias.canvas = false
        config.resolve.alias.encoding = false
        return(config)
    },

    // images: {
    //     domains: ["gravatar.com"],
    // }

    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
      },
};

export default nextConfig;
