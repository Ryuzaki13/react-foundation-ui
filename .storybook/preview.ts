import { RootDecorator } from "./root.decorator";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
	tags: ["autodocs"],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		a11y: {
			// Нарушения доступности отображаются в Storybook, но не блокируют текущий набор тестов.
			test: "todo"
		}
	},
	decorators: [RootDecorator]
};

export default preview;
