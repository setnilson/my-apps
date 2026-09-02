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
    cacheDir: '../../node_modules/.vite/sarah-s-app-wed-sep-2-4-33-07-pm',
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
                identifier: '6976eb07-da11-4f57-bafe-78b8b52b3270',
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
                name: "Sarah's App Wed, Sep 2, 4:33:07 pm",
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
