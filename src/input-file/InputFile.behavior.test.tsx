import { StrictMode } from "react";

import { ReadFileError, type ReadFileOptions, type ReadFileResult, type ReadMode } from "@ryuzaki13/react-foundation-lib/file";
import { act, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InputFile } from "./InputFile";

const { readFileMock } = vi.hoisted(() => ({
	readFileMock: vi.fn<(file: File, options?: ReadFileOptions) => Promise<ReadFileResult>>()
}));
vi.mock("@ryuzaki13/react-foundation-lib/file", async (importOriginal) => ({
	...(await importOriginal<typeof import("@ryuzaki13/react-foundation-lib/file")>()),
	readFile: readFileMock
}));

type DeferredFileRead = Readonly<{
	promise: Promise<ReadFileResult>;
	resolve: (result: ReadFileResult) => void;
	reject: (error: unknown) => void;
}>;

/** Управляемая задержка игнорирует abort намеренно: проверяем и уже поставленный в очередь stale callback. */
function createDeferredFileRead(): DeferredFileRead {
	let resolve!: DeferredFileRead["resolve"];
	let reject!: DeferredFileRead["reject"];
	const promise = new Promise<ReadFileResult>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

function createFileResult(file: File, mode: ReadMode = "data-url"): ReadFileResult {
	const meta = { name: file.name, mime: file.type, size: file.size, lastModified: file.lastModified };
	return mode === "array-buffer"
		? { mode, meta, file, buffer: new ArrayBuffer(file.size) }
		: { mode, meta, file, dataUrl: "data:application/pdf;base64,YWJj" };
}

function getFileInput(container: HTMLElement): HTMLInputElement {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]');
	if (!input) throw new Error("Не найден нативный контракт выбора файла.");
	return input;
}

const fileA = new File(["abc"], "first.pdf", { type: "application/pdf" });
const fileB = new File(["abc"], "latest.pdf", { type: "application/pdf" });

beforeEach(() => readFileMock.mockReset());

describe("InputFile: последнее чтение и его lifecycle", () => {
	it.each(["data-url", "array-buffer"] as const)("%s: поздний A не заменяет B и не завершает его reading", async (mode) => {
		const first = createDeferredFileRead();
		const latest = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(latest.promise);
		const onChange = vi.fn<(result: ReadFileResult) => void>();
		const onReadError = vi.fn();
		const onReadingChange = vi.fn();
		const props = { value: undefined, onChange, onReadError, onReadingChange };
		const mounted = render(
			mode === "array-buffer" ? <InputFile {...props} readMode="array-buffer" /> : <InputFile {...props} readMode="data-url" />
		);
		const input = getFileInput(mounted.container);
		fireEvent.change(input, { target: { files: [fileA] } });
		// Pending сообщается до вызова асинхронного reader: consumer не отправляет прошлый value.
		expect(onReadingChange.mock.invocationCallOrder[0]).toBeLessThan(readFileMock.mock.invocationCallOrder[0]!);
		fireEvent.change(input, { target: { files: [fileB] } });
		expect(readFileMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		expect(readFileMock.mock.calls[1]?.[1]?.signal?.aborted).toBe(false);
		await act(async () => first.resolve(createFileResult(fileA, mode)));
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadError).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true]]);
		const result = createFileResult(fileB, mode);
		await act(async () => latest.resolve(result));
		expect(onChange).toHaveBeenCalledExactlyOnceWith(result);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("сохраняет результат B, когда A заканчивается позже", async () => {
		const first = createDeferredFileRead();
		const latest = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(latest.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const mounted = render(<InputFile value={undefined} onChange={onChange} onReadingChange={onReadingChange} />);
		const input = getFileInput(mounted.container);
		fireEvent.change(input, { target: { files: [fileA] } });
		fireEvent.change(input, { target: { files: [fileB] } });
		const result = createFileResult(fileB);
		await act(async () => latest.resolve(result));
		await act(async () => first.resolve(createFileResult(fileA)));
		expect(onChange).toHaveBeenCalledExactlyOnceWith(result);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("ошибка старого A не сбрасывает reading B и не попадает в новое поле", async () => {
		const first = createDeferredFileRead();
		const latest = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(latest.promise);
		const onReadError = vi.fn();
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const mounted = render(
			<InputFile value={undefined} onChange={onChange} onReadError={onReadError} onReadingChange={onReadingChange} />
		);
		const input = getFileInput(mounted.container);
		fireEvent.change(input, { target: { files: [fileA] } });
		fireEvent.change(input, { target: { files: [fileB] } });
		await act(async () => first.reject(new ReadFileError("READ_FAILED")));
		expect(onReadError).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true]]);
		await act(async () => latest.resolve(createFileResult(fileB)));
		expect(onChange).toHaveBeenCalledOnce();
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("ошибка последнего B сохраняется и не заменяется поздним успешным A", async () => {
		const first = createDeferredFileRead();
		const latest = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(latest.promise);
		const onChange = vi.fn();
		const onReadError = vi.fn();
		const onReadingChange = vi.fn();
		const mounted = render(
			<InputFile value={undefined} onChange={onChange} onReadError={onReadError} onReadingChange={onReadingChange} />
		);
		const input = getFileInput(mounted.container);
		fireEvent.change(input, { target: { files: [fileA] } });
		fireEvent.change(input, { target: { files: [fileB] } });
		const error = new ReadFileError("FILE_TOO_LARGE");
		await act(async () => latest.reject(error));
		await act(async () => first.resolve(createFileResult(fileA)));
		expect(onReadError).toHaveBeenCalledExactlyOnceWith(error);
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it.each(["result", "error"] as const)("очистка отменяет read и отбрасывает поздний %s", async (completion) => {
		const read = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(read.promise);
		const onChange = vi.fn();
		const onReadError = vi.fn();
		const onClear = vi.fn();
		const onReadingChange = vi.fn();
		const mounted = render(
			<InputFile
				value={undefined}
				onChange={onChange}
				onReadError={onReadError}
				onClear={onClear}
				onReadingChange={onReadingChange}
			/>
		);
		fireEvent.change(getFileInput(mounted.container), { target: { files: [fileA] } });
		fireEvent.click(mounted.getByRole("button", { name: "Очистить значение" }));
		expect(onClear).toHaveBeenCalledOnce();
		expect(readFileMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
		await act(async () => {
			if (completion === "result") read.resolve(createFileResult(fileA));
			else read.reject(new ReadFileError("READ_FAILED"));
		});
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadError).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("unmount закрывает read до нового mount, включая StrictMode", async () => {
		const previous = createDeferredFileRead();
		const current = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(previous.promise).mockReturnValueOnce(current.promise);
		const onChange = vi.fn();
		const onReadError = vi.fn();
		const onReadingChange = vi.fn();
		const field = (
			<StrictMode>
				<InputFile value={undefined} onChange={onChange} onReadError={onReadError} onReadingChange={onReadingChange} />
			</StrictMode>
		);
		const closed = render(field);
		fireEvent.change(getFileInput(closed.container), { target: { files: [fileA] } });
		closed.unmount();
		expect(readFileMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		const reopened = render(field);
		fireEvent.change(getFileInput(reopened.container), { target: { files: [fileB] } });
		await act(async () => previous.resolve(createFileResult(fileA)));
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadError).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true], [false], [true]]);
		await act(async () => current.resolve(createFileResult(fileB)));
		expect(onChange).toHaveBeenCalledOnce();
		expect(onReadingChange.mock.calls).toEqual([[true], [false], [true], [false]]);
	});

	it("disabled отменяет текущий read и повторное включение не восстанавливает его callbacks", async () => {
		const read = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(read.promise);
		const onChange = vi.fn();
		const onReadError = vi.fn();
		const onReadingChange = vi.fn();
		const props = { value: undefined, onChange, onReadError, onReadingChange };
		const mounted = render(<InputFile {...props} />);
		const input = getFileInput(mounted.container);
		fireEvent.change(input, { target: { files: [fileA] } });
		mounted.rerender(<InputFile {...props} disabled />);
		expect(getFileInput(mounted.container)).toBe(input);
		expect(readFileMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
		const nativeClick = vi.spyOn(input, "click");
		fireEvent.click(mounted.getByRole("button"));
		fireEvent.change(input, { target: { files: [fileB] } });
		expect(nativeClick).not.toHaveBeenCalled();
		expect(readFileMock).toHaveBeenCalledOnce();
		mounted.rerender(<InputFile {...props} disabled={false} />);
		await act(async () => read.resolve(createFileResult(fileA)));
		expect(onChange).not.toHaveBeenCalled();
		expect(onReadError).not.toHaveBeenCalled();
		expect(onReadingChange.mock.calls).toEqual([[true], [false]]);
	});

	it("смена readMode отзывает pending result другого типа", async () => {
		const first = createDeferredFileRead();
		const latest = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(latest.promise);
		const onChange = vi.fn();
		const onReadingChange = vi.fn();
		const props = { value: undefined, onChange, onReadingChange };
		const mounted = render(<InputFile {...props} />);
		const input = getFileInput(mounted.container);
		fireEvent.change(input, { target: { files: [fileA] } });
		mounted.rerender(<InputFile {...props} readMode="array-buffer" />);
		fireEvent.change(input, { target: { files: [fileB] } });
		await act(async () => first.resolve(createFileResult(fileA)));
		expect(onChange).not.toHaveBeenCalled();
		expect(readFileMock.mock.calls[1]?.[1]).toMatchObject({ mode: "array-buffer", signal: expect.any(AbortSignal) });
		const result = createFileResult(fileB, "array-buffer");
		await act(async () => latest.resolve(result));
		expect(onChange).toHaveBeenCalledExactlyOnceWith(result);
		expect(onReadingChange.mock.calls).toEqual([[true], [false], [true], [false]]);
	});

	it("тот же native input принимает повторный выбор того же файла и передаёт public reader limits", async () => {
		const user = userEvent.setup();
		const first = createDeferredFileRead();
		const second = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
		const onChange = vi.fn();
		const mounted = render(<InputFile value={undefined} onChange={onChange} maxBytes={3} allowedMime={["application/pdf"]} />);
		const input = getFileInput(mounted.container);
		await user.upload(input, fileA);
		expect(input.value).toBe("");
		await act(async () => first.resolve(createFileResult(fileA)));
		await user.upload(input, fileA);
		expect(getFileInput(mounted.container)).toBe(input);
		expect(input.value).toBe("");
		expect(readFileMock).toHaveBeenCalledTimes(2);
		expect(readFileMock.mock.calls[1]).toEqual([
			fileA,
			{ maxBytes: 3, allowedMime: ["application/pdf"], signal: expect.any(AbortSignal) }
		]);
		await act(async () => second.resolve(createFileResult(fileA)));
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("обычный rerender не отменяет read и reading завершается через актуальный callback", async () => {
		const read = createDeferredFileRead();
		readFileMock.mockReturnValueOnce(read.promise);
		const onChange = vi.fn();
		const firstCallback = vi.fn();
		const latestCallback = vi.fn();
		const mounted = render(<InputFile value={undefined} onChange={onChange} onReadingChange={firstCallback} />);
		fireEvent.change(getFileInput(mounted.container), { target: { files: [fileA] } });
		mounted.rerender(
			<InputFile
				value={undefined}
				onChange={onChange}
				onReadingChange={latestCallback}
				description="Обновлено"
				readMode="data-url"
				disabled={false}
			/>
		);
		expect(readFileMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
		await act(async () => read.resolve(createFileResult(fileA)));
		expect(firstCallback.mock.calls).toEqual([[true]]);
		expect(latestCallback.mock.calls).toEqual([[false]]);
		expect(onChange).toHaveBeenCalledOnce();
	});
});
