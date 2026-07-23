import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

const configDirectory = fileURLToPath(new URL(".", import.meta.url));

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],
	addons: ["@chromatic-com/storybook", "@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
	framework: {
		name: "@storybook/react-vite",
		options: {}
	},
	docs: {
		defaultName: "Documentation",
		docsMode: false
	},
	viteFinal: (config) => ({
		...config,
		resolve: {
			...config.resolve,
			alias: [
				...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : []),
				{ find: "@/shared/ui", replacement: resolve(configDirectory, "../src/index.ts") },
				{ find: "@/styles", replacement: resolve(configDirectory, "../src/styles") }
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
