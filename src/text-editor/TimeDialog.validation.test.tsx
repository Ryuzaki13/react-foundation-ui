// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SemanticDialog } from "./SemanticDialog";
import { SemanticTagConfigs } from "./semanticTagConfigs";
import { TimeDialog } from "./TimeDialog";
import { TagTypes } from "./toolbar";

describe("проверка даты перед подтверждением диалога", () => {
	it.each(["2026-99-99", "2026-02-29", "2026-04-31"])("сохраняет открытый draft для %s", (from) => {
		const confirm = vi.fn();
		render(<TimeDialog onClose={vi.fn()} onConfirm={confirm} initialState={{ mode: "date", from }} />);
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		expect(confirm).not.toHaveBeenCalled();
		expect(screen.getByRole("textbox", { name: "Значение" })).toHaveProperty("value", from);
		expect(screen.getByText("Укажите существующую дату и корректное время")).toBeDefined();
	});
	it("не сохраняет скрытый конец диапазона после смены режима", () => {
		const confirm = vi.fn();
		render(<TimeDialog onClose={vi.fn()} onConfirm={confirm} initialState={{ mode: "range-time", from: "09:00", to: "18:00" }} />);
		fireEvent.click(screen.getByRole("radio", { name: "Время" }));
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		expect(confirm).toHaveBeenCalledWith("time", "09:00", { datetime: "09:00" });
	});
	it.each([TagTypes.del, TagTypes.ins])("проверяет необязательный datetime %s", (tag) => {
		const confirm = vi.fn();
		render(
			<SemanticDialog
				onClose={vi.fn()}
				onConfirm={confirm}
				config={SemanticTagConfigs[tag]}
				initialText="Текст"
				initialState={{ datetime: "2026-02-30" }}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		expect(confirm).not.toHaveBeenCalled();
		fireEvent.change(screen.getByRole("textbox", { name: tag === TagTypes.del ? "Когда был удалён" : "Когда был добавлен" }), {
			target: { value: "" }
		});
		fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
		expect(confirm).toHaveBeenCalledWith(tag, "Текст", { datetime: "", cite: "" });
	});
});
