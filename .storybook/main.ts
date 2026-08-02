import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import remarkGfm from "remark-gfm";

import type { StorybookConfig } from "@storybook/react-vite";

const configDirectory = fileURLToPath(new URL(".", import.meta.url));
const packageDirectory = resolve(configDirectory, "..");
const require = createRequire(import.meta.url);
const storybookDocsBlocks = require.resolve("@storybook/addon-docs/blocks");

const foundationDocumentationPackages = [
	{
		name: "@ryuzaki13/react-foundation-lib",
		localDirectory: resolve(configDirectory, "../../react-foundation-lib")
	},
	{
		name: "@ryuzaki13/react-foundation-api",
		localDirectory: resolve(configDirectory, "../../react-foundation-api")
	}
] as const;

/**
 * Определяет источник документации foundation-пакета.
 *
 * Локальный sibling-проект используется при совместной разработке пакетов, а
 * опубликованный package fallback позволяет собирать тот же Storybook в CI,
 * где доступен только установленный dependency.
 */
function resolveDocumentationPackageDirectory(packageName: string, localDirectory: string): string {
	if (existsSync(resolve(localDirectory, "package.json"))) {
		return localDirectory;
	}

	return dirname(require.resolve(`${packageName}/package.json`));
}

const foundationDocumentationDirectories = foundationDocumentationPackages.map(({ name, localDirectory }) =>
	resolveDocumentationPackageDirectory(name, localDirectory)
);

const foundationDocumentationStories = foundationDocumentationDirectories.map((packageDirectory) =>
	resolve(packageDirectory, "src/**/*.mdx").replaceAll("\\", "/")
);

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx", ...foundationDocumentationStories],
	addons: [
		"@chromatic-com/storybook",
		{
			name: "@storybook/addon-docs",
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						// Документация foundation-пакетов использует GFM-таблицы, которые не входят в стандартный CommonMark MDX.
						remarkPlugins: [remarkGfm]
					}
				}
			}
		},
		"@storybook/addon-a11y",
		"@storybook/addon-vitest"
	],
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
		server: {
			...config.server,
			fs: {
				...config.server?.fs,
				allow: [...(config.server?.fs?.allow ?? []), packageDirectory, ...foundationDocumentationDirectories]
			}
		},
		resolve: {
			...config.resolve,
			alias: [
				...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : []),
				// Внешние MDX используют addon-docs из UI-пакета, который владеет объединённым Storybook.
				{ find: "@storybook/addon-docs/blocks", replacement: storybookDocsBlocks },
				{ find: "@/shared/ui", replacement: resolve(configDirectory, "../src/index.ts") },
				{ find: "@/styles", replacement: resolve(configDirectory, "../src/styles") }
			]
		},
		define: {
			...config.define,
			__APP_BUILD_ID__: JSON.stringify("storybook"),
			__APP_ID__: JSON.stringify("react-foundation-ui-storybook"),
			// Foundation API читает базовый URL при загрузке модуля, поэтому Storybook
			// подставляет безопасный локальный путь до импорта OData-компонентов.
			__BASE_APP_CONFIG_URL__: JSON.stringify("/"),
			__DEV__: "true",
			__IMAGE_UPLOAD_MAX_BYTES__: JSON.stringify(10 * 1024 * 1024),
			__PREVIEW__: "false",
			__REACT_QUERY_PERSISTENCE_BUSTER__: JSON.stringify("react-foundation-ui-storybook"),
			__SAP_CLIENT__: JSON.stringify("100")
		}
	})
};

export default config;
