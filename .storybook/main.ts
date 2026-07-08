import { resolve } from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],
	addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
	framework: {
		name: "@storybook/react-vite",
		options: {}
	},
	viteFinal: (config) => ({
		...config,
		resolve: {
			...config.resolve,
			alias: [
				...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : []),
				{ find: "@/shared/ui", replacement: resolve(__dirname, "../src/index.ts") },
				{ find: "@/styles", replacement: resolve(__dirname, "../src/styles") }
			]
		},
		define: {
			...config.define,
			__APP_BUILD_ID__: JSON.stringify("storybook"),
			__APP_ID__: JSON.stringify("react-foundation-ui-storybook"),
			__DEV__: "true",
			__IMAGE_UPLOAD_MAX_BYTES__: JSON.stringify(10 * 1024 * 1024),
			__PREVIEW__: "false",
			__REACT_QUERY_PERSISTENCE_BUSTER__: JSON.stringify("react-foundation-ui-storybook")
		}
	})
};

export default config;
