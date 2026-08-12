import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import appManifest from './package.json';
import rootManifest from '../../package.json';

process.env.DD_SITE ||= rootManifest.datadogApps?.site;
process.env.DATADOG_SITE ||= process.env.DD_SITE;
process.env.DD_API_KEY ||= process.env.DATADOG_API_KEY;
process.env.DD_APP_KEY ||= process.env.DATADOG_APP_KEY;

const hasDatadogApiKeys = Boolean(process.env.DD_API_KEY && process.env.DD_APP_KEY);

export default defineConfig({
    base: './',
    cacheDir: '../../node_modules/.vite/sarah-s-app-wed-aug-12-1-34-27-pm',
    build: {
        sourcemap: true,
    },
    plugins: [
        react(),
        datadogVitePlugin({
            logLevel: 'debug',
            auth: {
                site: process.env.DD_SITE,
                apiKey: process.env.DD_API_KEY,
                appKey: process.env.DD_APP_KEY,
            },
            apps: {
                enable: true,
                authOverrides: {
                    method: hasDatadogApiKeys ? 'apiKey' : 'oauth',
                },
                identifier: 'a0711af62ede8478b5bbfa712a58106b',
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    releaseVersion: appManifest.version,
                    service: appManifest.name,
                },
            },
            metadata: {
                name: 'Timer',
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
