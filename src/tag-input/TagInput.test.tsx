// @vitest-environment jsdom

import React, { createRef, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagInput, type TagInputProps } from "./TagInput";

function TagInputHarness({ initialValue = [], ...props }: Omit<TagInputProps, "onChange" | "value"> & { initialValue?: string[] }) {
	const [value, setValue] = useState(initialValue);

	return <TagInput {...props} value={value} onChange={setValue} />;
}

describe("TagInput", () => {
	it("передаёт React 19 ref prop во внутренний input", () => {
		const inputRef = createRef<HTMLInputElement>();

		render(<TagInput ref={inputRef} label="Теги" value={[]} onChange={() => undefined} />);

		expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Теги" }));
	});

	it("добавляет нормализованные значения по Enter и запятой без дубликатов", () => {
		render(<TagInputHarness label="Теги" getTagKey={(tag) => tag.toLocaleLowerCase("ru")} placeholder="Введите тег" />);

		const input = screen.getByRole("textbox", { name: "Теги" }) as HTMLInputElement;

		fireEvent.change(input, { target: { value: "  Новости  " } });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.change(input, { target: { value: "Колледж" } });
		fireEvent.keyDown(input, { key: "," });
		fireEvent.change(input, { target: { value: "новости" } });
		fireEvent.keyDown(input, { key: "Enter" });

		const list = screen.getByRole("list", { name: "Добавленные теги" });
		expect(list.querySelectorAll("li")).toHaveLength(2);
		expect(list.textContent).toContain("Новости");
		expect(list.textContent).toContain("Колледж");
		expect(input.value).toBe("");
		expect(screen.getByText("Такой тег уже добавлен.").getAttribute("aria-live")).toBe("polite");
	});

	it("удаляет последний тег по Backspace и выбранный тег доступной кнопкой", () => {
		render(<TagInputHarness label="Теги" initialValue={["Первый", "Второй", "Третий"]} />);

		const input = screen.getByRole("textbox", { name: "Теги" });

		fireEvent.keyDown(input, { key: "Backspace" });
		expect(screen.queryByText("Третий")).toBeNull();
		expect(document.activeElement).toBe(input);

		fireEvent.click(screen.getByRole("button", { name: "Удалить тег «Первый»" }));
		expect(screen.queryByText("Первый")).toBeNull();
		expect(screen.getByText("Второй")).toBeDefined();
		expect(document.activeElement).toBe(input);
	});

	it("не фиксирует черновик при переходе фокуса на внутреннюю кнопку удаления", () => {
		render(<TagInputHarness label="Теги" initialValue={["Существующий"]} />);

		const input = screen.getByRole("textbox", { name: "Теги" }) as HTMLInputElement;
		const removeButton = screen.getByRole("button", { name: "Удалить тег «Существующий»" });

		fireEvent.change(input, { target: { value: "Черновик" } });
		fireEvent.blur(input, { relatedTarget: removeButton });

		expect(screen.queryByText("Черновик")).toBeNull();
		expect(input.value).toBe("Черновик");
	});

	it("разбирает вставленный список и фиксирует черновик при потере фокуса", () => {
		render(<TagInputHarness label="Теги" />);

		const input = screen.getByRole("textbox", { name: "Теги" }) as HTMLInputElement;
		fireEvent.paste(input, {
			clipboardData: {
				getData: () => "Один, Два\nТри"
			}
		});

		expect(screen.getByText("Один")).toBeDefined();
		expect(screen.getByText("Два")).toBeDefined();
		expect(screen.getByText("Три")).toBeDefined();

		fireEvent.change(input, { target: { value: "Четыре" } });
		fireEvent.blur(input);

		expect(screen.getByText("Четыре")).toBeDefined();
		expect(input.value).toBe("");
	});

	it("соблюдает maxTags и передаёт значения формы повторяющимися hidden-полями", () => {
		render(<TagInputHarness label="Теги" initialValue={["Один"]} maxTags={2} name="tags" form="material-form" />);

		const input = screen.getByRole("textbox", { name: "Теги" });
		fireEvent.change(input, { target: { value: "Два" } });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.change(input, { target: { value: "Три" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(screen.queryByText("Три")).toBeNull();
		expect(screen.getByText("Достигнуто максимальное количество тегов: 2.")).toBeDefined();

		const hiddenInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="tags"]'));
		expect(hiddenInputs.map((hiddenInput) => hiddenInput.value)).toEqual(["Один", "Два"]);
		expect(hiddenInputs.every((hiddenInput) => hiddenInput.getAttribute("form") === "material-form")).toBe(true);
	});

	it("связывает описание и ошибку с input и не изменяет readOnly-значение", () => {
		const handleChange = vi.fn<(value: string[]) => void>();

		render(
			<TagInput
				id="material-tags"
				label="Теги"
				description="Добавьте категории материала"
				error="Нужно исправить теги"
				value={["Новости"]}
				onChange={handleChange}
				readOnly
				data-field="metadata-tags"
			/>
		);

		const input = screen.getByRole("textbox", { name: "Теги" }) as HTMLInputElement;

		expect(input.readOnly).toBe(true);
		expect(input.getAttribute("data-field")).toBe("metadata-tags");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(input.getAttribute("aria-describedby")).toBe("material-tags-description material-tags-error");
		expect(screen.getByRole("alert").textContent).toBe("Нужно исправить теги");
		expect(screen.queryByRole("button", { name: "Удалить тег «Новости»" })).toBeNull();

		fireEvent.keyDown(input, { key: "Backspace" });
		fireEvent.paste(input, { clipboardData: { getData: () => "Другой, тег" } });
		expect(handleChange).not.toHaveBeenCalled();
	});

	it("уважает preventDefault потребительского keyboard handler", () => {
		const handleChange = vi.fn<(value: string[]) => void>();

		render(<TagInput label="Теги" value={[]} onChange={handleChange} onKeyDown={(event) => event.preventDefault()} />);

		const input = screen.getByRole("textbox", { name: "Теги" });
		fireEvent.change(input, { target: { value: "Черновик" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(handleChange).not.toHaveBeenCalled();
	});
});
