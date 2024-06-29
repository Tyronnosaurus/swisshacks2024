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
        domains: ['gravatar.com'],
    },

    webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    
        config.resolve.alias.canvas = false
        config.resolve.alias.encoding = false
        return(config)
    },

    images: {
        domains: ["gravatar.com"],
    }
};

export default nextConfig;
