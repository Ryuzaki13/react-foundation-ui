import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Splitter } from "./Splitter";
import { SplitterHeightContainer } from "./SplitterHeightContainer";

function renderContainer(props: Partial<Parameters<typeof SplitterHeightContainer>[0]> = {}) {
	return render(
		<SplitterHeightContainer {...props}>
			<Splitter>
				<div>Начальная панель</div>
				<div>Конечная панель</div>
			</Splitter>
		</SplitterHeightContainer>
	);
}

function getHeightSeparator() {
	return screen.getByRole("separator", { name: "Изменить высоту рабочей области" });
}

describe("SplitterHeightContainer", () => {
	it("задаёт viewport и отдельный горизонтальный separator", () => {
		renderContainer({ defaultHeight: 480 });

		const viewport = screen.getByText("Начальная панель").closest('[data-ui="splitter-height-viewport"]');
		const separator = getHeightSeparator();

		expect((viewport as HTMLElement | null)?.style.height).toBe("480px");
		expect(separator.getAttribute("aria-orientation")).toBe("horizontal");
		expect(separator.getAttribute("aria-valuenow")).toBe("480");
		expect(separator.getAttribute("aria-controls")).toBe(viewport?.id);
	});

	it("сообщает итоговую высоту только после завершения drag", () => {
		const onHeightChange = vi.fn();
		renderContainer({ defaultHeight: 480, minHeight: 360, maxHeight: 720, heightStep: 20, onHeightChange });
		const separator = getHeightSeparator();

		fireEvent.pointerDown(separator, { button: 0, pointerId: 1, clientY: 100 });
		fireEvent.pointerMove(document, { pointerId: 1, clientY: 178 });

		expect(onHeightChange).not.toHaveBeenCalled();

		fireEvent.pointerUp(document, { pointerId: 1, clientY: 178 });

		expect(onHeightChange).toHaveBeenCalledWith(558);
		expect(separator.getAttribute("aria-valuenow")).toBe("558");
	});

	it("поддерживает клавиатурный шаг и границы", () => {
		const onHeightChange = vi.fn();
		renderContainer({ defaultHeight: 360, minHeight: 360, maxHeight: 400, heightStep: 20, onHeightChange });
		const separator = getHeightSeparator();

		fireEvent.keyDown(separator, { key: "ArrowUp" });
		expect(onHeightChange).not.toHaveBeenCalled();

		fireEvent.keyDown(separator, { key: "ArrowDown" });
		expect(onHeightChange).toHaveBeenLastCalledWith(380);
		expect(separator.getAttribute("aria-valuenow")).toBe("380");

		fireEvent.keyDown(separator, { key: "End" });
		expect(onHeightChange).toHaveBeenLastCalledWith(400);
		expect(separator.getAttribute("aria-valuenow")).toBe("400");
	});

	it("в controlled-режиме не подменяет внешнее значение", () => {
		const onHeightChange = vi.fn();
		renderContainer({ height: 480, minHeight: 360, maxHeight: 720, heightStep: 20, onHeightChange });
		const separator = getHeightSeparator();

		fireEvent.keyDown(separator, { key: "ArrowDown" });

		expect(onHeightChange).toHaveBeenCalledWith(500);
		expect(separator.getAttribute("aria-valuenow")).toBe("480");
	});
});
