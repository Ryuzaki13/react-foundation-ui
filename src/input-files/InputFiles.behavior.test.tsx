import { type ReadFileOptions, type ReadFileResult, ReadFileError } from "@ryuzaki13/react-foundation-lib/file";
import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InputFiles } from "./InputFiles";

const { read } = vi.hoisted(() => ({ read: vi.fn<(file: File, options?: ReadFileOptions) => Promise<ReadFileResult>>() }));
vi.mock("@ryuzaki13/react-foundation-lib/file", async (original) => ({
	...(await original<typeof import("@ryuzaki13/react-foundation-lib/file")>()),
	readFile: read
}));

/** Управляемое чтение игнорирует abort, чтобы проверить защиту от позднего callback. */
function deferredRead() {
	let resolve!: (value: ReadFileResult) => void;
	const promise = new Promise<ReadFileResult>((complete) => {
		resolve = complete;
	});
	return { promise, resolve };
}
const first = new File(["abc"], "first.pdf", { type: "application/pdf" });
const second = new File(["def"], "second.pdf", { type: "application/pdf" });
function result(file: File): Extract<ReadFileResult, { mode: "data-url" }> {
	return {
		mode: "data-url",
		file,
		meta: { name: file.name, mime: file.type, size: file.size, lastModified: file.lastModified },
		dataUrl: "data:application/pdf;base64,YWJj"
	};
}
function input(container: HTMLElement) {
	const element = container.querySelector<HTMLInputElement>('input[type="file"]');
	if (!element) throw new Error("Нет поля выбора файлов.");
	return element;
}
beforeEach(() => {
	read.mockReset();
});

describe("InputFiles: чтение группы файлов", () => {
	it("multiple читает всю группу перед onChange и сохраняет прежний выбор", async () => {
		const pending = deferredRead();
		read.mockResolvedValueOnce(result(first)).mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const previous = result(new File(["old"], "old.pdf"));
		const h = render(<InputFiles value={[previous]} onChange={onChange} onReadingChange={onReadingChange} />);
		expect(input(h.container).multiple).toBe(true);
		await act(async () => fireEvent.change(input(h.container), { target: { files: [first, second] } }));
		expect(onReadingChange.mock.calls).toEqual([[true]]);
		expect(onChange).not.toHaveBeenCalled();
		await act(async () => pending.resolve(result(second)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith([previous, result(first), result(second)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});
	it("новый выбор отзывает прежнюю группу без промежуточного false", async () => {
		const old = deferredRead();
		const latest = deferredRead();
		read.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const h = render(<InputFiles value={[]} onChange={onChange} onReadingChange={onReadingChange} />);
		fireEvent.change(input(h.container), { target: { files: [first, second] } });
		fireEvent.change(input(h.container), { target: { files: [second] } });
		expect(read.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		await act(async () => old.resolve(result(first)));
		expect(read).toHaveBeenCalledTimes(2);
		expect(onReadingChange.mock.calls).toEqual([[true]]);
		await act(async () => latest.resolve(result(second)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith([result(second)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});
	it.each(["disabled", "unmount", "remove"] as const)("%s отзывает поздний callback группы", async (mode) => {
		const pending = deferredRead();
		read.mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const props = { value: [result(first)], onChange, onReadingChange };
		const h = render(<InputFiles {...props} />);
		fireEvent.change(input(h.container), { target: { files: [second] } });
		if (mode === "disabled") h.rerender(<InputFiles {...props} disabled />);
		else if (mode === "unmount") h.unmount();
		else {
			const remove = h.container.querySelector('button[type="button"]');
			if (!remove) throw new Error("Нет кнопки удаления.");
			fireEvent.click(remove);
		}
		await act(async () => pending.resolve(result(second)));
		expect(onChange.mock.calls).toEqual(mode === "remove" ? [[[]]] : []);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
		if (mode === "disabled") expect(h.container.querySelector<HTMLButtonElement>('button[type="button"]')?.disabled).toBe(true);
	});
	it("ошибка одного файла оставляет успешные результаты и завершает чтение", async () => {
		const error = new ReadFileError("FILE_TOO_LARGE");
		read.mockRejectedValueOnce(error).mockResolvedValueOnce(result(second));
		const onChange = vi.fn();
		const onReadError = vi.fn();
		const onReadingChange = vi.fn();
		const h = render(
			<InputFiles value={[]} maxBytes={4} onChange={onChange} onReadError={onReadError} onReadingChange={onReadingChange} />
		);
		await act(async () => fireEvent.change(input(h.container), { target: { files: [first, second] } }));
		expect(onReadError).toHaveBeenCalledExactlyOnceWith(error);
		expect(onChange).toHaveBeenCalledExactlyOnceWith([result(second)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});
	it("array-buffer сохраняет режим и ограничивает группу оставшимся maxFiles", async () => {
		const buffer: Extract<ReadFileResult, { mode: "array-buffer" }> = {
			file: first,
			meta: result(first).meta,
			mode: "array-buffer",
			buffer: new ArrayBuffer(3)
		};
		read.mockResolvedValue(buffer);
		const onChange = vi.fn();
		const h = render(<InputFiles readMode="array-buffer" value={[]} maxFiles={1} maxBytes={10} onChange={onChange} />);
		await act(async () => fireEvent.change(input(h.container), { target: { files: [first, second] } }));
		expect(read).toHaveBeenCalledExactlyOnceWith(
			first,
			expect.objectContaining({ mode: "array-buffer", maxBytes: 10, signal: expect.any(AbortSignal) })
		);
		expect(onChange).toHaveBeenCalledExactlyOnceWith([buffer]);
	});
	it("отказ всей группы завершает reading и не меняет выбранные файлы", async () => {
		read.mockRejectedValue(new ReadFileError("READ_FAILED"));
		const onChange = vi.fn();
		const onReadError = vi.fn();
		const onReadingChange = vi.fn();
		const h = render(<InputFiles value={[]} onChange={onChange} onReadError={onReadError} onReadingChange={onReadingChange} />);
		await act(async () => fireEvent.change(input(h.container), { target: { files: [first, second] } }));
		expect(onReadError).toHaveBeenCalledTimes(2);
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});
	it("повторный выбор одного файла не создаёт конфликтов React и удаляется по одному элементу", () => {
		const errors = vi.spyOn(console, "error");
		try {
			const selected = result(first);
			const onChange = vi.fn();
			const h = render(<InputFiles value={[selected, selected]} onChange={onChange} />);
			const remove = h.container.querySelector('button[type="button"]');
			if (!remove) throw new Error("Нет удаления выбранного файла.");
			fireEvent.click(remove);
			expect(onChange).toHaveBeenCalledExactlyOnceWith([selected]);
			expect(errors).not.toHaveBeenCalled();
		} finally {
			errors.mockRestore();
		}
	});
	it("явные значения defaults при rerender не отменяют чтение", async () => {
		const pending = deferredRead();
		read.mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const props = { value: [], onChange, onReadingChange };
		const h = render(<InputFiles {...props} />);
		fireEvent.change(input(h.container), { target: { files: [first] } });
		h.rerender(<InputFiles {...props} readMode="data-url" disabled={false} />);
		expect(read.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
		await act(async () => pending.resolve(result(first)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith([result(first)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});
});
