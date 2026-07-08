import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globalConfig from "./config/eslint/global";
import ignoresConfig from "./config/eslint/ignores";
import prettierConfig from "./config/eslint/prettier";
import storiesConfig from "./config/eslint/stories";

export default defineConfig([ignoresConfig, tseslint.configs.recommended, globalConfig, prettierConfig, storiesConfig]);
