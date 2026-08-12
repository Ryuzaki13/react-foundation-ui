// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OptionButton } from "./OptionButton";

describe("OptionButton", () => {
	it("собирает icon, slot, text и code в фиксированном порядке", () => {
		render(<OptionButton icon={<span>Иконка</span>} slot={<span>Слот</span>} text="Текст" searchText="Поиск" code="Код" />);

		const option = screen.getByRole("button");
		expect(option.textContent).toBe("ИконкаСлотТекстКод");
		expect(option.children).toHaveLength(4);
		expect(screen.getByText("Текст").getAttribute("data-search-text")).toBe("Поиск");
	});

	it("рендерит hotkey как альтернативу code", () => {
		render(<OptionButton text="Копировать" hotkey="Ctrl+C" />);

		expect(screen.getByText("Ctrl+C").tagName).toBe("KBD");
	});
});
