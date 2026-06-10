import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Real (symlink-resolved) location of the workspace packages.
const packagesDir = path.resolve(__dirname, '../../packages');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pnpm symlinks the prebuilt CommonJS workspace packages
    // (@novanode/shared, @novanode/sdk) into node_modules, but webpack
    // resolves the symlink to its real path under packages/. Because that
    // path is outside node_modules, Next applies React Fast Refresh to it,
    // injecting `import.meta.webpackHot.accept()` into a CommonJS file and
    // crashing with "Cannot use 'import.meta' outside a module".
    //
    // Walk the rule tree and exclude packagesDir from any next-swc-loader
    // rule so these already-compiled packages are consumed as-is.
    const usesRefreshLoader = (rule) => {
      const uses = Array.isArray(rule.use) ? rule.use : rule.use ? [rule.use] : [];
      const loaders = [rule.loader, ...uses.map((u) => (typeof u === 'string' ? u : u && u.loader))];
      return loaders.some(
        (l) =>
          typeof l === 'string' &&
          (l.includes('next-swc-loader') || l.includes('react-refresh')),
      );
    };

    const addExclude = (rules) => {
      for (const rule of rules) {
        if (!rule || typeof rule !== 'object') continue;
        if (Array.isArray(rule.oneOf)) addExclude(rule.oneOf);
        if (Array.isArray(rule.rules)) addExclude(rule.rules);
        if (usesRefreshLoader(rule)) {
          if (Array.isArray(rule.exclude)) {
            rule.exclude.push(packagesDir);
          } else if (rule.exclude) {
            rule.exclude = [rule.exclude, packagesDir];
          } else {
            rule.exclude = [packagesDir];
          }
        }
      }
    };

    addExclude(config.module.rules);
    return config;
  },
};

export default nextConfig;
