import { type Meta, type StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ThemeContrastGallery } from "./ThemeContrastGallery";
import { themeContrastThemes } from "./themeContrastThemes";

const meta = {
	title: "Development/Theme contrast",
	component: ThemeContrastGallery,
	parameters: {
		layout: "fullscreen"
	}
} satisfies Meta<typeof ThemeContrastGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comparison: Story = {
	name: "Сравнение исходных и рассчитанных тем",
	play: async ({ canvasElement, userEvent }) => {
		// Проверяется браузерное наследование и интерактивность. Численные
		// гарантии контраста принадлежат тестам Sass-механизма, а не его копии в JS.
		const highBackgrounds = new Set<string>();
		for (const theme of themeContrastThemes) {
			const normal = canvasElement.querySelector<HTMLElement>(`[data-contrast-theme="${theme.id}"][data-contrast="normal"]`);
			const high = canvasElement.querySelector<HTMLElement>(`[data-contrast-theme="${theme.id}"][data-contrast="high"]`);
			if (!normal || !high) {
				throw new Error(`Не найдена пара образцов темы ${theme.id}.`);
			}

			const normalStyle = getComputedStyle(normal);
			const highStyle = getComputedStyle(high);
			const normalMuted = normal.querySelector<HTMLElement>("[data-text-role=muted]");
			const highMuted = high.querySelector<HTMLElement>("[data-text-role=muted]");
			if (!normalMuted || !highMuted) {
				throw new Error(`Не найдена приглушённая подпись темы ${theme.id}.`);
			}
			await expect(highStyle.backgroundColor).toBe(normalStyle.backgroundColor);
			await expect(getComputedStyle(highMuted).color).not.toBe(getComputedStyle(normalMuted).color);
			highBackgrounds.add(highStyle.backgroundColor);

			const input = high.querySelector<HTMLInputElement>("[data-contrast-input=editable]");
			const checkBox = high.querySelector<HTMLInputElement>("[data-contrast-checkbox=selection]");
			const action = high.querySelector<HTMLButtonElement>("[data-contrast-button=accent]");
			const success = high.querySelector<HTMLButtonElement>("[data-contrast-button=success]");
			const clipped = high.querySelector<HTMLButtonElement>("[data-contrast-button=clipped]");
			const output = high.querySelector<HTMLOutputElement>("[data-contrast-output=activation]");
			if (!input || !checkBox || !action || !success || !clipped || !output) {
				throw new Error(`Не найдены интерактивные элементы темы ${theme.id}.`);
			}
			await userEvent.type(input, "Контраст");
			await expect(input).toHaveValue("Контраст");
			await userEvent.click(checkBox);
			await expect(checkBox).not.toBeChecked();
			await userEvent.click(action);
			await expect(output).toHaveTextContent("1");
			await userEvent.click(success);
			await userEvent.tab();
			await expect(clipped).toHaveFocus();
			await expect(clipped.matches(":focus-visible")).toBe(true);
			await expect(getComputedStyle(clipped).outlineStyle).not.toBe("none");
		}
		// Каждый high-образец сохраняет свою цветную поверхность.
		await expect(highBackgrounds.size).toBe(themeContrastThemes.length);
	}
};
