import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Splitter } from "./Splitter";

describe("Splitter", () => {
	it("сообщает итоговую пропорцию после изменения с клавиатуры", () => {
		const onChange = vi.fn();

		render(
			<div style={{ height: 400 }}>
				<Splitter initial={0.4} onChange={onChange}>
					<div>Начальная панель</div>
					<div>Конечная панель</div>
				</Splitter>
			</div>
		);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });

		expect(onChange).toHaveBeenCalledOnce();
		expect(onChange.mock.calls[0]?.[0]).toBeCloseTo(0.42);
	});

	it("сообщает только итоговую пропорцию после завершения drag", () => {
		const onChange = vi.fn();

		render(
			<div style={{ height: 400 }}>
				<Splitter initial={0.4} onChange={onChange}>
					<div>Начальная панель</div>
					<div>Конечная панель</div>
				</Splitter>
			</div>
		);

		const separator = screen.getByRole("separator");
		const splitter = separator.parentElement;
		if (!splitter) throw new Error("Не найден контейнер Splitter");

		vi.spyOn(splitter, "getBoundingClientRect").mockReturnValue({
			width: 500,
			height: 400,
			top: 0,
			right: 500,
			bottom: 400,
			left: 0,
			x: 0,
			y: 0,
			toJSON: () => undefined
		});

		fireEvent.pointerDown(separator, { button: 0, pointerId: 1, clientX: 100 });
		fireEvent.pointerMove(document, { pointerId: 1, clientX: 150 });
		expect(onChange).not.toHaveBeenCalled();

		fireEvent.pointerUp(document, { pointerId: 1, clientX: 150 });
		expect(onChange).toHaveBeenCalledOnce();
		expect(onChange.mock.calls[0]?.[0]).toBeCloseTo(0.5);
	});

	it("не сообщает изменение при попытке выйти за ограничение", () => {
		const onChange = vi.fn();

		render(
			<div style={{ height: 400 }}>
				<Splitter initial={0.5} max={0.5} onChange={onChange}>
					<div>Начальная панель</div>
					<div>Конечная панель</div>
				</Splitter>
			</div>
		);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });

		expect(onChange).not.toHaveBeenCalled();
	});
});
