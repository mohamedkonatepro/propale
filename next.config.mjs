/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/api/:path*',
        has: [
          {
            type: 'header',
            key: 'Host',
            value: 'propale.co',
          },
        ],
        destination: 'https://www.propale.co/api/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
