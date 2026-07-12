import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

type PackageJson = {
	readonly name: string;
	readonly version: string;
	readonly peerDependencies?: Record<string, string>;
	readonly devDependencies?: Record<string, string>;
};

const packageJson = require("./package.json") as PackageJson;

const externalPackages = Object.keys(packageJson.peerDependencies ?? {});
const missingPeerDevDependencies = externalPackages.filter((packageName) => packageJson.devDependencies?.[packageName] === undefined);

if (missingPeerDevDependencies.length > 0) {
	throw new Error("Peer dependencies must also be present in devDependencies for local build: " + missingPeerDevDependencies.join(", "));
}

function isExternalPackage(id: string): boolean {
	// CSS-файлы implementation-зависимостей входят в общий styles.css пакета,
	// а JavaScript peer-зависимостей остаётся внешним и разрешается host-приложением.
	if (id.endsWith(".css")) return false;

	return externalPackages.some((packageName) => id === packageName || id.startsWith(packageName + "/"));
}

function collectEntries(): Record<string, string> {
	const sourceRoot = resolve("src");
	const entries: Record<string, string> = {};

	entries["styles-entry"] = resolve("src/styles-entry.ts");
	entries["types"] = resolve("src/types.ts");

	for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;

		const filePath = resolve(sourceRoot, entry.name, "index.ts");
		if (!existsSync(filePath)) continue;

		entries[`${entry.name}/index`] = filePath;
	}

	return Object.fromEntries(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)));
}

function createDefine(configEnv: { mode: string }): Record<string, string> {
	if (configEnv.mode !== "test" && process.env.VITEST !== "true") {
		return {};
	}

	const packageId = packageJson.name + "@" + packageJson.version;

	return {
		__APP_BUILD_ID__: JSON.stringify(packageId),
		__APP_ID__: JSON.stringify(packageId),
		__DEV__: "true",
		__IMAGE_UPLOAD_MAX_BYTES__: JSON.stringify(10 * 1024 * 1024),
		__PREVIEW__: "false",
		__REACT_QUERY_PERSISTENCE_BUSTER__: JSON.stringify("react-foundation-ui-query-test"),
		__BASE_APP_CONFIG_URL__: JSON.stringify("/")
	};
}

export default defineConfig((configEnv) => ({
	define: createDefine(configEnv),
	plugins: [react()],
	resolve: {
		alias: {
			"@/styles": resolve("src/styles")
		}
	},
	css: {
		modules: {
			generateScopedName: configEnv.command === "build" ? "[hash:base64:6]" : "[name]__[local]"
		},
		preprocessorOptions: {
			scss: {
				quietDeps: true
			}
		}
	},
	build: {
		target: "es2022",
		sourcemap: true,
		emptyOutDir: true,
		copyPublicDir: false,
		cssCodeSplit: false,
		lib: {
			entry: collectEntries(),
			formats: ["es"],
			cssFileName: "styles"
		},
		rollupOptions: {
			external: isExternalPackage,
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "chunks/[name]-[hash].js",
				assetFileNames: (assetInfo) => {
					if (assetInfo.names.includes("styles.css")) {
						return "[name][extname]";
					}

					return "assets/[name][extname]";
				}
			}
		}
	},
	test: {
		environment: "jsdom",
		setupFiles: ["src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist"]
	}
}));
