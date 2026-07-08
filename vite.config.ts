import { readdirSync, readFileSync } from "node:fs";
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
	return externalPackages.some((packageName) => id === packageName || id.startsWith(packageName + "/"));
}

function walkSourceFiles(directory: string, predicate: (filePath: string) => boolean): string[] {
	const result: string[] = [];

	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const filePath = resolve(directory, entry.name);

		if (entry.isDirectory()) {
			result.push(...walkSourceFiles(filePath, predicate));
		} else if (predicate(filePath)) {
			result.push(filePath);
		}
	}

	return result;
}

function toEntryName(filePath: string): string {
	return filePath
		.replace(resolve("src"), "")
		.replace(/^\//, "")
		.replace(/\\/g, "/")
		.replace(/\.tsx?$/, "");
}

function isApiBoundStory(filePath: string): boolean {
	const entryName = toEntryName(filePath);
	if (entryName.includes("OData")) return true;
	if (entryName === "table/stories/Table.stories") return true;
	if (entryName === "tree-table/stories/TreeTable.stories") return true;

	const source = readFileSync(filePath, "utf8");
	return source.includes("@ryuzaki13/react-foundation-api/");
}

function collectEntries(): Record<string, string> {
	const entries: Record<string, string> = {};

	entries["styles-entry"] = resolve("src/styles-entry.ts");
	entries["types"] = resolve("src/types.ts");

	for (const filePath of walkSourceFiles(resolve("src"), (file) => file.endsWith("/index.ts"))) {
		const entryName = toEntryName(filePath);
		if (entryName.includes("/stories/")) continue;
		if (entryName.endsWith("/model/index")) continue;
		if (entryName.endsWith("/lib/index")) continue;
		if (entryName.endsWith("/ui/index")) continue;

		entries[entryName] = filePath;
	}

	for (const filePath of walkSourceFiles(resolve("src"), (file) => /\/stories\/[^/]+\.stories\.tsx?$/.test(file))) {
		if (isApiBoundStory(filePath)) continue;
		entries[toEntryName(filePath)] = filePath;
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
