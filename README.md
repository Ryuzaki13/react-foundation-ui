# @ryuzaki13/react-foundation-ui

React UI primitives, выделенные из бывшего `src/shared/ui`.

Пакет публикуется в npm как обычная публичная библиотека, но его основная цель практическая: разделить повторно используемый UI-слой между собственными проектами автора. Это не попытка сделать универсальную дизайн-систему для всех сценариев. API, стили и Storybook в первую очередь оптимизируются под семейство проектов, где рядом используются `@ryuzaki13/react-foundation-lib` и `@ryuzaki13/react-foundation-api`.

## Импорты

Корневой импорт намеренно не открыт. Используйте точечные entrypoints:

```tsx
import { Button } from "@ryuzaki13/react-foundation-ui/button";
import { ContextMenu } from "@ryuzaki13/react-foundation-ui/context-menu";
import type { UiControlProps } from "@ryuzaki13/react-foundation-ui/types";
```

Стили подключаются отдельно и один раз на уровне host-приложения.

## Подключение стилей

### Готовый CSS

Самый простой вариант подходит для песочниц или приложений, которым достаточно дефолтных токенов пакета:

```ts
import "@ryuzaki13/react-foundation-ui/styles.css";
```

В этом режиме значения CSS-переменных уже скомпилированы в `dist/styles.css`. Host-проект может переопределять их обычным CSS поверх, но это runtime override, а не build-time настройка.

### Sass с настройкой host-проекта

Для рабочих проектов предпочтительнее Sass API. Он позволяет задать значения переменных на этапе сборки:

```scss
@use "@ryuzaki13/react-foundation-ui/styles/config" with (
	$root-token-overrides: (
		"--font-family": (
			"Inter",
			sans-serif
		),
		"--font-family-mono": (
			"JetBrains Mono",
			monospace
		),
		"--radius-md": 8px
	),
	$light-theme-overrides: (
		tokens: (
			"--surface-0": #ffffff,
			"--surface-1": #f6f7f9,
			"--surface-2": #eceff3,
			"--content-0": #111827,
			"--content-1": #374151,
			"--content-2": #6b7280
		)
	)
);

@use "@ryuzaki13/react-foundation-ui/styles.scss";
```

Важно: `styles/config` должен быть настроен до первого подключения любых foundation styles в Sass module graph. Иначе Sass уже загрузит конфиг с дефолтами и повторная настройка через `with (...)` не сработает.

### Host со своими темами

Если проект сам управляет темами, например через `data-theme="light:default"`, `data-scheme="light"` и `data-theme-mode="default"`, лучше подключать базовый слой отдельно от selectors:

```scss
@use "@ryuzaki13/react-foundation-ui/styles/config" with (
	$root-token-overrides: (
		"--font-family": (
			"Inter",
			sans-serif
		)
	),
	$light-theme-overrides: (
		tokens: (
			"--surface-0": #ffffff,
			"--surface-1": #f6f7f9,
			"--surface-2": #eceff3
		)
	),
	$dark-theme-overrides: (
		tokens: (
			"--surface-0": #0b0b0b,
			"--surface-1": #151515,
			"--surface-2": #202020
		)
	)
);

@use "@ryuzaki13/react-foundation-ui/styles/foundation";
@use "@ryuzaki13/react-foundation-ui/styles/themes" as foundationThemes;

:root[data-theme="light:default"] {
	@include foundationThemes.light-theme;
}

:root[data-theme="dark:default"] {
	@include foundationThemes.dark-theme;
}
```

`styles/foundation` подключает normalize, root tokens, base styles и utility classes, но не навязывает дефолтные selectors `data-theme="light"` / `data-theme="dark"`. Selectors остаются ответственностью host-приложения.

Обычно в host-проекте это оформляется отдельным entrypoint, например `src/app/styles/shared.scss`, который сначала настраивает foundation config, затем подключает foundation styles, темы и доменные CSS-переменные приложения.

## Storybook

Stories и MDX не экспортируются как public API пакета. Вместо этого пакет собирает готовую статическую документацию:

```bash
npm run build-storybook
```

Результат лежит в `storybook-static` и включается в npm package через `files`. После установки пакета host-проект может отдать эту директорию:

```bash
npx http-server node_modules/@ryuzaki13/react-foundation-ui/storybook-static -p 6007
```

Такой запуск покажет готовые stories пакета, но не подмешает theme tokens конкретного host-проекта. Если нужно видеть компоненты в проектной теме, host должен запускать небольшую обертку:

1. отдать файлы из `node_modules/@ryuzaki13/react-foundation-ui/storybook-static`;
2. скомпилировать свой SCSS entrypoint, например `src/app/styles/shared.scss`;
3. внедрить ссылку на host CSS в `iframe.html`;
4. выставить нужные атрибуты на `document.documentElement`: `data-theme`, `data-scheme`, `data-theme-mode` и связанные accessibility presets;
5. отдавать host public assets, например шрифты, не перекрывая `storybook-static/assets`.

Именно host отвечает за конкретные значения CSS-переменных. Это позволяет одному и тому же Storybook пакета отображаться по-разному в разных проектах без копирования stories и MDX.

Пример обертки для запуска storybook в host проекте:

```mjs
#!/usr/bin/env node

// tools/serveFoundationUiStorybook.mjs

import { existsSync, readFileSync, statSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const projectRequire = createRequire(join(projectRoot, "package.json"));
const options = parseArgs(process.argv.slice(2));
const styleEntry = resolve(projectRoot, options.styles);
const publicRoot = resolve(projectRoot, options.public);
const storybookRoot = resolveFoundationStorybookRoot();

await assertFile(styleEntry, "Style entry");
await assertDirectory(storybookRoot, "Foundation UI Storybook");
await compileHostStyles();

const server = createServer(async (request, response) => {
	try {
		const requestUrl = new URL(request.url ?? "/", `http://${options.host}:${options.port}`);

		if (requestUrl.pathname === "/__foundation-host-styles.css") {
			const css = await compileHostStyles();
			send(response, 200, css, "text/css; charset=utf-8");
			return;
		}

		if (requestUrl.pathname.startsWith("/assets/")) {
			const storybookAssetPath = resolve(storybookRoot, `.${requestUrl.pathname}`);

			if (isInside(storybookRoot, storybookAssetPath) && isFile(storybookAssetPath)) {
				await serveFile(response, storybookRoot, requestUrl.pathname);
				return;
			}

			await serveFile(response, publicRoot, requestUrl.pathname);
			return;
		}

		const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;

		if (pathname === "/iframe.html") {
			const html = await readFile(join(storybookRoot, "iframe.html"), "utf8");
			send(response, 200, injectHostPreview(html), "text/html; charset=utf-8");
			return;
		}

		await serveFile(response, storybookRoot, pathname);
	} catch (error) {
		const status = error?.code === "ENOENT" ? 404 : 500;
		send(response, status, status === 404 ? "Not found" : String(error?.stack ?? error), "text/plain; charset=utf-8");
	}
});

server.listen(options.port, options.host, () => {
	console.log(`Foundation UI Storybook: http://${options.host}:${options.port}`);
});

function parseArgs(args) {
	const result = {
		host: "127.0.0.1",
		port: 6007,
		public: "public",
		styles: "src/app/styles/shared.scss",
		theme: "light:default",
		scheme: undefined,
		themeMode: undefined,
		attrs: []
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (arg === "--host") result.host = readArgValue(args, ++index, arg);
		else if (arg === "--port") result.port = Number(readArgValue(args, ++index, arg));
		else if (arg === "--public") result.public = readArgValue(args, ++index, arg);
		else if (arg === "--styles") result.styles = readArgValue(args, ++index, arg);
		else if (arg === "--theme") result.theme = readArgValue(args, ++index, arg);
		else if (arg === "--scheme") result.scheme = readArgValue(args, ++index, arg);
		else if (arg === "--theme-mode") result.themeMode = readArgValue(args, ++index, arg);
		else if (arg === "--attr") result.attrs.push(readArgValue(args, ++index, arg));
		else if (arg === "--help") printHelpAndExit();
		else throw new Error(`Unknown argument: ${arg}`);
	}

	if (!Number.isInteger(result.port) || result.port <= 0) {
		throw new Error(`Invalid --port value: ${result.port}`);
	}

	return result;
}

function readArgValue(args, index, name) {
	const value = args[index];

	if (!value || value.startsWith("--")) {
		throw new Error(`Missing value for ${name}`);
	}

	return value;
}

function printHelpAndExit() {
	console.log(
		[
			"Usage: node tools/serveFoundationUiStorybook.mjs [options]",
			"",
			"Options:",
			"  --styles <path>      Host SCSS/CSS entry. Default: src/app/styles/shared.scss",
			"  --public <path>      Host public directory. Default: public",
			"  --theme <value>      data-theme value. Default: light:default",
			"  --scheme <value>     data-scheme value. Default: first part of --theme",
			"  --theme-mode <value> data-theme-mode value. Default: second part of --theme",
			"  --attr <name=value>  Additional html attribute. Can be repeated.",
			"  --host <host>        Server host. Default: 127.0.0.1",
			"  --port <port>        Server port. Default: 6007"
		].join("\n")
	);
	process.exit(0);
}

function resolveFoundationStorybookRoot() {
	const packageJsonPath = projectRequire.resolve("@ryuzaki13/react-foundation-ui/package.json");
	return join(dirname(packageJsonPath), "storybook-static");
}

async function assertFile(filePath, label) {
	const fileStat = await stat(filePath);

	if (!fileStat.isFile()) {
		throw new Error(`${label} is not a file: ${filePath}`);
	}
}

async function assertDirectory(directoryPath, label) {
	const directoryStat = await stat(directoryPath);

	if (!directoryStat.isDirectory()) {
		throw new Error(`${label} is not a directory: ${directoryPath}`);
	}
}

async function compileHostStyles() {
	const extension = extname(styleEntry);

	if (extension === ".css") {
		return readFile(styleEntry, "utf8");
	}

	const sass = await loadSass();
	const result = sass.compile(styleEntry, {
		style: "compressed",
		loadPaths: [projectRoot, join(projectRoot, "src"), join(projectRoot, "node_modules")],
		importers: [createSourceAliasImporter()]
	});

	return result.css;
}

async function loadSass() {
	for (const packageName of ["sass-embedded", "sass"]) {
		try {
			const module = await import(projectRequire.resolve(packageName));
			return module.default ?? module;
		} catch {
			// Try the next Sass implementation from the host project.
		}
	}

	throw new Error("Install `sass` or `sass-embedded` in the host project to compile Storybook styles.");
}

function createSourceAliasImporter() {
	return {
		canonicalize(url, context) {
			if (url.startsWith("@/")) {
				const filePath = resolveSassFile(resolve(projectRoot, "src", url.slice(2)));
				return filePath ? pathToFileURL(filePath) : null;
			}

			if (context.containingUrl?.protocol === "file:") {
				const containingPath = fileURLToPath(context.containingUrl);
				const filePath = resolveSassFile(resolve(dirname(containingPath), url));

				if (filePath && isInside(projectRoot, filePath)) {
					return pathToFileURL(filePath);
				}
			}

			return null;
		},
		load(canonicalUrl) {
			const filePath = fileURLToPath(canonicalUrl);

			return {
				contents: readFileSync(filePath, "utf8"),
				syntax: resolveSassSyntax(filePath)
			};
		}
	};
}

function resolveSassFile(filePath) {
	const extension = extname(filePath);
	const candidates = extension
		? [filePath, join(dirname(filePath), `_${basename(filePath)}`)]
		: [
				filePath,
				`${filePath}.scss`,
				`${filePath}.sass`,
				`${filePath}.css`,
				join(dirname(filePath), `_${basename(filePath)}.scss`),
				join(dirname(filePath), `_${basename(filePath)}.sass`),
				join(filePath, "_index.scss"),
				join(filePath, "_index.sass"),
				join(filePath, "index.scss"),
				join(filePath, "index.sass")
			];

	return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function isFile(filePath) {
	return existsSync(filePath) && statSync(filePath).isFile();
}

function resolveSassSyntax(filePath) {
	if (filePath.endsWith(".sass")) return "indented";
	if (filePath.endsWith(".css")) return "css";
	return "scss";
}

function injectHostPreview(html) {
	const attributes = resolveHtmlAttributes();
	const script = `<script>(()=>{const root=document.documentElement;const attrs=${JSON.stringify(attributes)};for(const [name,value] of Object.entries(attrs)){if(value)root.setAttribute(name,value);}})();</script>`;
	const link = `<link rel="stylesheet" href="./__foundation-host-styles.css" data-foundation-host-styles>`;

	return html.replace("</head>", `${script}\n${link}\n</head>`);
}

function resolveHtmlAttributes() {
	const [schemeFromTheme, modeFromTheme] = options.theme.split(":");
	const attributes = {
		"data-theme": options.theme,
		"data-scheme": options.scheme ?? schemeFromTheme,
		"data-theme-mode": options.themeMode ?? modeFromTheme ?? "default",
		"data-contrast": "auto",
		"data-motion": "auto",
		"data-line-height": "normal",
		"data-letter-spacing": "normal",
		"data-word-spacing": "normal",
		"data-paragraph-spacing": "normal"
	};

	for (const attr of options.attrs) {
		const separatorIndex = attr.indexOf("=");

		if (separatorIndex < 1) {
			throw new Error(`Invalid --attr value: ${attr}`);
		}

		attributes[attr.slice(0, separatorIndex)] = attr.slice(separatorIndex + 1);
	}

	return attributes;
}

async function serveFile(response, root, requestPathname) {
	const filePath = resolve(root, `.${requestPathname}`);

	if (!isInside(root, filePath)) {
		send(response, 403, "Forbidden", "text/plain; charset=utf-8");
		return;
	}

	const fileStat = await stat(filePath);

	if (!fileStat.isFile()) {
		send(response, 404, "Not found", "text/plain; charset=utf-8");
		return;
	}

	send(response, 200, await readFile(filePath), contentType(filePath));
}

function isInside(root, filePath) {
	const pathFromRoot = relative(root, filePath);
	return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !pathFromRoot.includes(`..${sep}`));
}

function contentType(filePath) {
	const extension = extname(filePath);

	if (extension === ".html") return "text/html; charset=utf-8";
	if (extension === ".js") return "text/javascript; charset=utf-8";
	if (extension === ".css") return "text/css; charset=utf-8";
	if (extension === ".json") return "application/json; charset=utf-8";
	if (extension === ".svg") return "image/svg+xml";
	if (extension === ".png") return "image/png";
	if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
	if (extension === ".woff") return "font/woff";
	if (extension === ".woff2") return "font/woff2";

	return "application/octet-stream";
}

function send(response, status, body, type) {
	response.writeHead(status, {
		"Cache-Control": "no-store",
		"Content-Type": type
	});
	response.end(body);
}
```

И небольшой скрип запуска:

```json
{
	"scripts": {
		"serve-ui-storybook": "node tools/serveFoundationUiStorybook.mjs --styles src/app/styles/shared.scss --theme light:default --port 6007"
	}
}
```

Для разработки самого пакета:

```bash
npm run storybook
npm run build-storybook
npm run serve-storybook
```

Для проверки npm-артефакта:

```bash
npm run pack:dry-run
```

## Зависимости

UI-пакет напрямую опирается на `@ryuzaki13/react-foundation-lib`.

Часть entrypoints с OData-компонентами импортирует `@ryuzaki13/react-foundation-api/odata`. Если host-проект использует такие компоненты, он должен установить совместимую версию `@ryuzaki13/react-foundation-api` рядом с UI-пакетом. В Storybook самого пакета эта зависимость используется для демонстрационных сценариев.
