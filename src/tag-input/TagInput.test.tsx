// @vitest-environment jsdom

import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagInput } from "./TagInput";
import { TagInputControlledFixture } from "./test-fixtures/TagInputControlledFixture";

describe("TagInput", () => {
	it("передаёт React 19 ref prop во внутренний input", () => {
		const inputRef = createRef<HTMLInputElement>();

		render(<TagInput ref={inputRef} label="Теги" value={[]} onChange={() => undefined} />);

		expect(inputRef.current).toBe(screen.getByRole("textbox"));
	});

	it("добавляет нормализованные значения по Enter и запятой без дубликатов", () => {
		const onChange = vi.fn<(value: string[]) => void>();
		const mounted = render(<TagInputControlledFixture onChange={onChange} getTagKey={(tag) => tag.toLocaleLowerCase("ru")} />);
		const input = screen.getByRole("textbox");

		fireEvent.change(input, { target: { value: "  Новости  " } });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.change(input, { target: { value: "Колледж" } });
		fireEvent.keyDown(input, { key: "," });

		// Проверяем доступность объявления, а не формулировку служебного сообщения.
		const announcement = mounted.container.querySelector('[aria-live="polite"]');
		const announcementBeforeDuplicate = announcement?.textContent;

		fireEvent.change(input, { target: { value: "новости" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onChange.mock.calls).toEqual([[["Новости"]], [["Новости", "Колледж"]]]);
		expect(input).toHaveProperty("value", "");
		expect(announcement?.getAttribute("aria-atomic")).toBe("true");
		expect(announcement?.textContent?.trim()).toBeTruthy();
		expect(announcement?.textContent).not.toBe(announcementBeforeDuplicate);
	});

	it("удаляет последний тег по Backspace и выбранный тег доступной кнопкой", () => {
		const onChange = vi.fn<(value: string[]) => void>();
		const mounted = render(<TagInputControlledFixture onChange={onChange} initialValue={["Первый", "Второй", "Третий"]} />);
		const input = screen.getByRole("textbox");

		fireEvent.keyDown(input, { key: "Backspace" });
		expect(onChange).toHaveBeenCalledExactlyOnceWith(["Первый", "Второй"]);
		expect(document.activeElement).toBe(input);

		// Контракт data-action сохраняет смысл действия Badge при смене подписи кнопки.
		const removeButton = mounted.container.querySelector('button[data-action="remove-badge"]');
		if (!removeButton) throw new Error("Недоступно действие удаления тега");
		expect(screen.getAllByRole("button")).toContain(removeButton);
		fireEvent.click(removeButton);
		expect(onChange.mock.calls).toEqual([[["Первый", "Второй"]], [["Второй"]]]);
		expect(document.activeElement).toBe(input);
	});

	it("не фиксирует черновик при переходе фокуса на внутреннюю кнопку удаления", () => {
		const onChange = vi.fn<(value: string[]) => void>();
		const mounted = render(<TagInputControlledFixture onChange={onChange} initialValue={["Существующий"]} />);
		const input = screen.getByRole("textbox");
		const removeButton = mounted.container.querySelector('button[data-action="remove-badge"]');
		if (!removeButton) throw new Error("Недоступно действие удаления тега");
		expect(screen.getAllByRole("button")).toContain(removeButton);

		fireEvent.change(input, { target: { value: "Черновик" } });
		fireEvent.blur(input, { relatedTarget: removeButton });

		expect(onChange).not.toHaveBeenCalled();
		expect(input).toHaveProperty("value", "Черновик");
	});

	it("разбирает вставленный список и фиксирует черновик при потере фокуса", () => {
		const onChange = vi.fn<(value: string[]) => void>();
		render(<TagInputControlledFixture onChange={onChange} />);
		const input = screen.getByRole("textbox");
		fireEvent.paste(input, {
			clipboardData: {
				getData: () => "Один, Два\nТри"
			}
		});

		expect(onChange).toHaveBeenCalledExactlyOnceWith(["Один", "Два", "Три"]);

		fireEvent.change(input, { target: { value: "Четыре" } });
		fireEvent.blur(input);

		expect(onChange.mock.calls).toEqual([[["Один", "Два", "Три"]], [["Один", "Два", "Три", "Четыре"]]]);
		expect(input).toHaveProperty("value", "");
	});

	it("соблюдает maxTags и передаёт все теги во внешнюю форму", () => {
		const onChange = vi.fn<(value: string[]) => void>();
		const formRef = createRef<HTMLFormElement>();
		render(
			<>
				<form ref={formRef} id="material-form" />
				<TagInputControlledFixture onChange={onChange} initialValue={["Один"]} maxTags={2} name="tags" form="material-form" />
			</>
		);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "Два" } });
		fireEvent.keyDown(input, { key: "Enter" });
		fireEvent.change(input, { target: { value: "Три" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(onChange).toHaveBeenCalledExactlyOnceWith(["Один", "Два"]);
		if (!formRef.current) throw new Error("Внешняя форма недоступна");
		expect(new FormData(formRef.current).getAll("tags")).toEqual(["Один", "Два"]);
	});

	it("связывает описание и ошибку с input и не изменяет readOnly-значение", () => {
		const handleChange = vi.fn<(value: string[]) => void>();
		const description = "Описание поля";
		const error = "Ошибка поля";

		const mounted = render(
			<TagInput
				id="material-tags"
				label="Теги"
				description={description}
				error={error}
				value={["Новости"]}
				onChange={handleChange}
				readOnly
				data-field="metadata-tags"
			/>
		);

		const input = screen.getByRole("textbox");
		const alert = screen.getByRole("alert");
		const describedElements = (input.getAttribute("aria-describedby")?.split(/\s+/) ?? []).map((id) => document.getElementById(id));

		expect(input).toHaveProperty("readOnly", true);
		expect(input.getAttribute("data-field")).toBe("metadata-tags");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		// Связи ARIA проверяются по реально связанным узлам, без предположения о формате их id.
		expect(describedElements).toContain(alert);
		expect(describedElements).not.toContain(null);
		expect(describedElements.map((element) => element?.textContent)).toEqual(expect.arrayContaining([description, error]));
		expect(alert.textContent).toBe(error);
		expect(mounted.container.querySelector('[data-action="remove-badge"]')).toBeNull();

		fireEvent.keyDown(input, { key: "Backspace" });
		fireEvent.paste(input, { clipboardData: { getData: () => "Другой, тег" } });
		expect(handleChange).not.toHaveBeenCalled();
	});

	it("уважает preventDefault потребительского keyboard handler", () => {
		const handleChange = vi.fn<(value: string[]) => void>();

		render(<TagInput label="Теги" value={[]} onChange={handleChange} onKeyDown={(event) => event.preventDefault()} />);

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "Черновик" } });
		fireEvent.keyDown(input, { key: "Enter" });

		expect(handleChange).not.toHaveBeenCalled();
	});
});
