import { describe, expect, it } from "vitest";

import { OptionText } from "../../option";

import { extractPickerTextContent } from "./extractPickerTextContent";

describe("extractPickerTextContent", () => {
	it("извлекает текст из вложенного ReactNode", () => {
		expect(
			extractPickerTextContent(
				<span>
					Подразделение <strong>Урал</strong>
				</span>
			)
		).toBe("Подразделение Урал");
	});

	it("использует явный searchText для компонента с произвольным render", () => {
		expect(extractPickerTextContent(<OptionText searchText="Скрытый поисковый текст">Произвольный render</OptionText>)).toBe(
			"Скрытый поисковый текст"
		);
	});
});
