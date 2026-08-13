// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Option } from "./Option";
import { OptionButton } from "./OptionButton";

describe("OptionButton", () => {
	it("оставляет внешний вид строки оболочке Option и собирает содержимое внутренней кнопки", () => {
		render(
			<Option data-testid="option" active selected>
				<OptionButton icon={<span>Иконка</span>} text="Текст" searchText="Поиск" code="Код" />
			</Option>
		);

		const wrapper = screen.getByTestId("option");
		const option = screen.getByRole("button");
		expect(wrapper.firstElementChild).toBe(option);
		expect(option.textContent).toBe("ИконкаТекстКод");
		expect(option.children).toHaveLength(3);
		expect(screen.getByText("Текст").getAttribute("data-search-text")).toBe("Поиск");
	});

	it("рендерит hotkey как альтернативу code", () => {
		render(<OptionButton text="Копировать" hotkey="Ctrl+C" />);

		expect(screen.getByText("Ctrl+C").tagName).toBe("KBD");
	});
});
