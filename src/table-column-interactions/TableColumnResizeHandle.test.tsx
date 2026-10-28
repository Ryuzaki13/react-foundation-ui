import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableColumnResizeHandle } from "./TableColumnResizeHandle";

describe("относительная ширина при resize", () => {
	it("переводит экранный шаг клавиатуры в em при текущем шрифте таблицы", () => {
		const onResize = vi.fn();
		const onReset = vi.fn();
		const view = render(
			<table style={{ fontSize: 16 }}>
				<tbody>
					<tr>
						<th>
							<TableColumnResizeHandle
								columnId="name"
								unit="em"
								getStartWidth={() => 320}
								onResize={onResize}
								onReset={onReset}
							/>
						</th>
					</tr>
				</tbody>
			</table>
		);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
		expect(onResize).toHaveBeenLastCalledWith("name", 20.5);

		view.rerender(
			<table style={{ fontSize: 20 }}>
				<tbody>
					<tr>
						<th>
							<TableColumnResizeHandle
								columnId="name"
								unit="em"
								getStartWidth={() => 400}
								onResize={onResize}
								onReset={onReset}
							/>
						</th>
					</tr>
				</tbody>
			</table>
		);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
		expect(onResize).toHaveBeenLastCalledWith("name", 20.4);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "Home" });
		expect(onReset).toHaveBeenCalledWith("name");
	});

	it("сохраняет pointer delta в em и передаёт итоговый размер после жеста", () => {
		const onResize = vi.fn();
		const onResizeEnd = vi.fn();
		render(
			<table style={{ fontSize: 16 }}>
				<tbody>
					<tr>
						<th>
							<TableColumnResizeHandle
								columnId="name"
								unit="em"
								getStartWidth={() => 320}
								onResize={onResize}
								onResizeEnd={onResizeEnd}
							/>
						</th>
					</tr>
				</tbody>
			</table>
		);
		const handle = screen.getByRole("separator");
		handle.setPointerCapture = vi.fn();
		handle.releasePointerCapture = vi.fn();

		fireEvent(handle, new MouseEvent("pointerdown", { bubbles: true, clientX: 100, button: 0 }));
		fireEvent(handle, new MouseEvent("pointermove", { bubbles: true, clientX: 148 }));
		fireEvent(handle, new MouseEvent("pointerup", { bubbles: true, clientX: 148 }));

		expect(onResize).toHaveBeenLastCalledWith("name", 23);
		expect(onResizeEnd).toHaveBeenLastCalledWith("name", 23);
	});

	it("сохраняет прежний пиксельный callback и minimum без явного выбора единицы", () => {
		const onResize = vi.fn();
		render(<TableColumnResizeHandle columnId="name" getStartWidth={() => 62} onResize={onResize} />);

		fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowLeft" });
		expect(onResize).toHaveBeenCalledWith("name", 60);
	});
});
