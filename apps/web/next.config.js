/** @type {import('next').NextConfig} */
function resolveApiUrlForBuild() {
  const fromEnv = process.env.API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const host =
    process.env.API_INTERNAL_HOST ||
    process.env.API_HOST ||
    (process.env.RAILWAY_ENVIRONMENT ? 'api.railway.internal' : 'localhost');

  const port = process.env.API_SERVICE_PORT || process.env.API_PORT || '4000';
  if (host === 'localhost') return `http://localhost:${port}`;
  return `http://${host}:${port}`;
}

const apiUrl = resolveApiUrlForBuild();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: `${apiUrl}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
