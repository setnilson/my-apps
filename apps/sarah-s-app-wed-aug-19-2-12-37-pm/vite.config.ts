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
    cacheDir: '../../node_modules/.vite/sarah-s-app-wed-aug-19-2-12-37-pm',
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
                identifier: '4ff68482ec606c364112503397a914c7',
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
                name: "Sarah's App Wed, Aug 19, 2:12:37 pm",
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
