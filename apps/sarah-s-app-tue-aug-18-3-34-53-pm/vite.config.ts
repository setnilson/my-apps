import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { version } from './package.json';
import rootManifest from '../../package.json';

process.env.DD_SITE ||= rootManifest.datadogApps?.site;
process.env.DATADOG_SITE ||= process.env.DD_SITE;

const hasDatadogApiKeys = Boolean(
    (process.env.DD_API_KEY || process.env.DATADOG_API_KEY) &&
        (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY),
);

export default defineConfig({
    base: './',
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
                name: 'Calculator',
                description: 'A compact calculator for quick arithmetic.',
                authOverrides: {
                    method: hasDatadogApiKeys ? 'apiKey' : 'oauth',
                },
                // Stable identity for this app, generated once when the project was scaffolded.
                // DO NOT change this value, and DO NOT set it to the app's UUID from App Builder.
                // Every upload targets the app matching this identifier — changing it makes the
                // next upload create a brand-new app instead of updating this one.
                identifier: '5ef349a1b04ee57966e08f519394f24a',
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    releaseVersion: version,
                    service: 'sarah-s-app-tue-aug-18-3-34-53-pm',
                }
            },
            metadata: {
                name: 'Calculator',
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
