/** @type {import('next').NextConfig} */
const nextConfig = {
  // Les erreurs TypeScript et ESLint ne sont plus ignorées au build :
  // elles doivent bloquer, sinon on publie du code cassé (le projet est
  // propre : tsc --noEmit passe, eslint 0 erreur).
  //
  // `cpus: 1` reste pour le build sur le VPS (machine partagée, peu de RAM).
  // En local, pour builder plus vite : NEXT_BUILD_CPUS=0 npm run build
  ...(process.env.NEXT_BUILD_CPUS === "0"
    ? {}
    : { experimental: { cpus: 1 } }),
};

export default nextConfig;
