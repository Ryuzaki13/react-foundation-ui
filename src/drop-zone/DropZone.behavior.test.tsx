import { type ReadFileOptions, type ReadFileResult, ReadFileError } from "@ryuzaki13/react-foundation-lib/file";
import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DropZone } from "./DropZone";

const { read } = vi.hoisted(() => ({ read: vi.fn<(file: File, options?: ReadFileOptions) => Promise<ReadFileResult>>() }));
vi.mock("@ryuzaki13/react-foundation-lib/file", async (original) => ({
	...(await original<typeof import("@ryuzaki13/react-foundation-lib/file")>()),
	readFile: read
}));

/** Чтение намеренно игнорирует abort: поздний результат должен отозвать сам компонент. */
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

function zone(container: HTMLElement) {
	const element = container.querySelector<HTMLElement>('[role="button"]');
	if (!element) throw new Error("Нет зоны перетаскивания файлов.");
	return element;
}

beforeEach(() => {
	read.mockReset();
});

describe("DropZone: выбор и чтение файлов", () => {
	it("по умолчанию заменяет прежний выбор только после чтения всей новой группы", async () => {
		const pending = deferredRead();
		read.mockResolvedValueOnce(result(first)).mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const h = render(<DropZone value={[result(new File(["old"], "old.pdf"))]} onChange={onChange} onReadingChange={onReadingChange} />);

		await act(async () => fireEvent.change(input(h.container), { target: { files: [first, second] } }));
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true]]);
		await act(async () => pending.resolve(result(second)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith([result(first), result(second)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("append добавляет успешные файлы drop к прежним и сообщает об ошибке отдельного файла", async () => {
		const previous = result(new File(["old"], "old.pdf"));
		const error = new ReadFileError("FILE_TOO_LARGE");
		read.mockRejectedValueOnce(error).mockResolvedValueOnce(result(second));
		const onChange = vi.fn();
		const onChangeError = vi.fn();
		const onClearError = vi.fn();
		const onReadingChange = vi.fn();
		const h = render(
			<DropZone
				append
				value={[previous]}
				onChange={onChange}
				onChangeError={onChangeError}
				onReadingChange={onReadingChange}
				error="Прежняя ошибка"
				onClearError={onClearError}
			/>
		);

		await act(async () => fireEvent.drop(zone(h.container), { dataTransfer: { files: [first, second] } }));
		expect(onClearError).toHaveBeenCalledExactlyOnceWith();
		expect(onChangeError).toHaveBeenCalledExactlyOnceWith(error);
		expect(onChange).toHaveBeenCalledExactlyOnceWith([previous, result(second)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("append дополняет последнее внешнее значение после завершения отложенного чтения", async () => {
		const pending = deferredRead();
		read.mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const external = result(new File(["external"], "external.pdf", { type: "application/pdf" }));
		const h = render(<DropZone append value={[result(first)]} onChange={onChange} />);

		fireEvent.change(input(h.container), { target: { files: [second] } });
		h.rerender(<DropZone append value={[external]} onChange={onChange} />);
		expect(read.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
		await act(async () => pending.resolve(result(second)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith([external, result(second)]);
	});

	it("новый выбор отзывает незавершённую группу без промежуточного завершения reading", async () => {
		const old = deferredRead();
		const latest = deferredRead();
		read.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const h = render(<DropZone value={[]} onChange={onChange} onReadingChange={onReadingChange} />);

		fireEvent.change(input(h.container), { target: { files: [first, second] } });
		fireEvent.drop(zone(h.container), { dataTransfer: { files: [second] } });
		expect(read.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		await act(async () => old.resolve(result(first)));
		expect(read).toHaveBeenCalledTimes(2);
		expect(onReadingChange.mock.calls).toEqual([[true]]);
		await act(async () => latest.resolve(result(second)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith([result(second)]);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it.each(["disabled", "unmount", "remove"] as const)("%s отменяет чтение и не принимает его поздний результат", async (mode) => {
		const pending = deferredRead();
		read.mockReturnValueOnce(pending.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const props = { append: true, value: [result(first)], onChange, onReadingChange };
		const h = render(<DropZone {...props} />);

		fireEvent.change(input(h.container), { target: { files: [second] } });
		if (mode === "disabled") h.rerender(<DropZone {...props} disabled />);
		else if (mode === "unmount") h.unmount();
		else fireEvent.click(h.getByRole("button", { name: "Удалить first.pdf" }));
		expect(read.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		await act(async () => pending.resolve(result(second)));
		expect(onChange.mock.calls).toEqual(mode === "remove" ? [[[]]] : []);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
		if (mode === "disabled") {
			expect(input(h.container).disabled).toBe(true);
			expect(h.getByRole<HTMLButtonElement>("button", { name: "Удалить first.pdf" }).disabled).toBe(true);
		}
	});

	it("single array-buffer читает только первый файл и сохраняет режим и ограничение размера", async () => {
		const buffer: Extract<ReadFileResult, { mode: "array-buffer" }> = {
			file: first,
			meta: result(first).meta,
			mode: "array-buffer",
			buffer: new ArrayBuffer(3)
		};
		read.mockResolvedValue(buffer);
		const onChange = vi.fn();
		const h = render(<DropZone readMode="array-buffer" multiple={false} maxBytes={10} value={[]} onChange={onChange} />);

		await act(async () => fireEvent.drop(zone(h.container), { dataTransfer: { files: [first, second] } }));
		expect(input(h.container).multiple).toBe(false);
		expect(read).toHaveBeenCalledExactlyOnceWith(
			first,
			expect.objectContaining({ mode: "array-buffer", maxBytes: 10, signal: expect.any(AbortSignal) })
		);
		expect(onChange).toHaveBeenCalledExactlyOnceWith([buffer]);
	});
});
