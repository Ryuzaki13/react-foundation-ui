import { afterEach, describe, expect, it, vi } from "vitest";

import { revealTextEditorCaretInEditable } from "./revealTextEditorCaretInEditable";

const originalRangeRect = Object.getOwnPropertyDescriptor(Range.prototype, "getBoundingClientRect");

afterEach(() => {
	vi.restoreAllMocks();
	if (originalRangeRect) Object.defineProperty(Range.prototype, "getBoundingClientRect", originalRangeRect);
	else Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
	document.body.replaceChildren();
});

function createEditable(caretTop: number, caretHeight = 20): HTMLElement {
	const root = document.createElement("div");
	root.contentEditable = "true";
	root.tabIndex = 0;
	root.innerHTML = "<p>Текст</p>";
	document.body.append(root);
	root.focus({ preventScroll: true });
	Object.defineProperties(root, {
		clientHeight: { configurable: true, value: 100 },
		scrollHeight: { configurable: true, value: 400 }
	});
	vi.spyOn(root, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100, 200, 100));
	Object.defineProperty(Range.prototype, "getBoundingClientRect", {
		configurable: true,
		value: () => new DOMRect(0, caretTop, 0, caretHeight)
	});
	const text = root.firstChild?.firstChild;
	if (!text) throw new Error("Нет узла каретки");
	const range = document.createRange();
	range.setStart(text, 2);
	range.collapse(true);
	document.getSelection()?.removeAllRanges();
	document.getSelection()?.addRange(range);
	return root;
}

describe("адресное раскрытие каретки", () => {
	it.each([
		[80, 50, 30],
		[190, 50, 60],
		[130, 50, 50],
		[900, 50, 300]
	])("прокручивает только editable: caret=%s", (caretTop, initialScroll, expectedScroll) => {
		const root = createEditable(caretTop);
		root.scrollTop = initialScroll;
		const pageScroll = vi.spyOn(window, "scrollBy");
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(expectedScroll);
		expect(pageScroll).not.toHaveBeenCalled();
	});

	it("учитывает внутренний padding и границы scrollport", () => {
		const root = createEditable(190);
		root.style.padding = "10px 0";
		root.scrollTop = 50;
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(70);
	});

	it("не измеряет каретку, пока короткое поле не имеет overflow", () => {
		const root = createEditable(190);
		Object.defineProperty(root, "scrollHeight", { value: 100 });
		const measurement = vi.spyOn(Range.prototype, "getBoundingClientRect");
		revealTextEditorCaretInEditable(root);
		expect(measurement).not.toHaveBeenCalled();
		expect(root.scrollTop).toBe(0);
	});

	it("измеряет соседний символ clone Range без изменения выделения", () => {
		const root = createEditable(0, 0);
		const selected = document.getSelection()?.getRangeAt(0);
		vi.spyOn(Range.prototype, "getBoundingClientRect").mockImplementation(function (this: Range) {
			return this.collapsed ? new DOMRect() : new DOMRect(0, 190, 10, 20);
		});
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(10);
		expect(document.getSelection()?.getRangeAt(0)).toBe(selected);
		expect(document.getSelection()?.anchorOffset).toBe(2);
	});

	it("измеряет пустой paragraph при нулевом Range", () => {
		const root = createEditable(0, 0);
		const paragraph = root.firstElementChild;
		if (!(paragraph instanceof HTMLElement)) throw new Error("Нет абзаца");
		paragraph.innerHTML = "<br>";
		const range = document.createRange();
		range.setStart(paragraph, 0);
		range.collapse(true);
		document.getSelection()?.removeAllRanges();
		document.getSelection()?.addRange(range);
		vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 190, 200, 20));
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(10);
	});

	it("не возвращает длинный абзац к началу при Shift+Enter", () => {
		const root = createEditable(0, 0);
		root.scrollTop = 100;
		const paragraph = root.firstElementChild;
		if (!(paragraph instanceof HTMLElement)) throw new Error("Нет абзаца");
		paragraph.innerHTML = "Текст<br><br>";
		vi.spyOn(paragraph, "getBoundingClientRect").mockReturnValue(new DOMRect(0, -100, 200, 310));
		const br = paragraph.lastElementChild;
		if (!(br instanceof HTMLBRElement)) throw new Error("Нет текущей строки");
		vi.spyOn(br, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 190, 0, 20));
		const range = document.createRange();
		range.setStart(paragraph, 2);
		range.collapse(true);
		document.getSelection()?.removeAllRanges();
		document.getSelection()?.addRange(range);
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(110);
	});

	it("игнорирует ошибочный rect выше содержимого, а не реальную прокрутку вверх", () => {
		const root = createEditable(-100);
		root.scrollTop = 50;
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(50);
	});

	it.each(["blur", "range", "outside", "hidden"])("не раскрывает чужое или недоступное выделение: %s", (scenario) => {
		const root = createEditable(250);
		root.scrollTop = 50;
		if (scenario === "blur") root.blur();
		if (scenario === "range")
			document
				.getSelection()
				?.getRangeAt(0)
				.setEnd(root.firstChild?.firstChild ?? root, 4);
		if (scenario === "outside") {
			const outside = document.createElement("p");
			outside.textContent = "Внешнее выделение";
			document.body.append(outside);
			const range = document.createRange();
			range.setStart(outside, 0);
			range.collapse(true);
			document.getSelection()?.removeAllRanges();
			document.getSelection()?.addRange(range);
		}
		if (scenario === "hidden") Object.defineProperty(root, "clientHeight", { value: 0 });
		revealTextEditorCaretInEditable(root);
		expect(root.scrollTop).toBe(50);
	});
});
