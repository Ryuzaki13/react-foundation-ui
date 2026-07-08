import type { Linter } from "eslint";

const storiesConfig: Linter.Config = {
	files: ["src/**/*.stories.{ts,tsx}"],
	rules: {
		"react-hooks/rules-of-hooks": "off"
	}
};

export default storiesConfig;
