import { formatDateAsDateTime, formatDateAsODataDatetime, formatDateAsTime } from "@ryuzaki13/react-foundation-lib/formatters";
import { fn } from "storybook/test";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { SingleDateTimeInput, type SingleDateTimeInputProps } from "../ui/SingleDateTimeInput";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "UI/SingleDateTimeInput",
	component: SingleDateTimeInput,
	args: {
		value: null,
		onChange: fn<NonNullable<SingleDateTimeInputProps["onChange"]>>()
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок поля даты и времени.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком поля.",
			control: "text"
		},
		placeholder: {
			description: "Текстовая подсказка для сегментного ввода.",
			control: "text"
		},
		value: {
			description: "Текущее значение в виде `Date | null`.",
			control: false
		},
		onChange: {
			description: "Вызывается при вводе или выборе валидной даты-времени.",
			control: false
		},
		minDate: {
			description: "Минимально допустимая дата-время.",
			control: "date"
		},
		maxDate: {
			description: "Максимально допустимая дата-время.",
			control: "date"
		},
		error: {
			description: "Текст внешней ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Сбрасывает внешнюю ошибку при ручном вводе и выборе в picker.",
			control: false
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		disabled: {
			description: "Блокирует сегментный ввод и popover picker.",
			control: "boolean"
		},
		timePanelPlacement: {
			description: "Размещение панели выбора времени относительно календаря.",
			control: "inline-radio",
			options: ["bottom", "right"]
		},
		mode: {
			description: "Режим работы поля: дата-время или только время.",
			control: "inline-radio",
			options: ["date-time", "time"]
		}
	}
} satisfies Meta<typeof SingleDateTimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

type ValueFormat = "date-time" | "time" | "none";

function createSingleDateTimeInputStoryRender(valueFormat: ValueFormat) {
	return createControlledStoryRender<SingleDateTimeInputProps>((args, updateArgs) => {
		const value = args.value ?? null;

		return (
			<div>
				<SingleDateTimeInput
					{...args}
					value={value}
					onChange={(nextValue) => {
						args.onChange(nextValue);
						updateArgs({ value: nextValue });
					}}
					onClearError={() => {
						args.onClearError?.();
						updateArgs({ error: undefined });
					}}
				/>

				{valueFormat === "date-time" && (
					<>
						<p>
							Вывод значения через <code className="statusInfo">formatDateAsDateTime(value)</code>:
						</p>
						<pre>{formatDateAsDateTime(value)}</pre>
						<p>
							Вывод значения через <code className="statusInfo">formatDateAsODataDatetime(value)</code>:
						</p>
						<pre>{formatDateAsODataDatetime(value)}</pre>
					</>
				)}

				{valueFormat === "time" && (
					<>
						<p>
							Вывод значения через <code className="statusInfo">formatDateAsTime(value)</code>:
						</p>
						<pre>{formatDateAsTime(value)}</pre>
						<p>Техническая дата значения всегда фиксируется как 01.01.1970.</p>
						<pre>{value ? value.toISOString() : ""}</pre>
					</>
				)}
			</div>
		);
	});
}

/**
 * Демонстрирует основной сценарий выбора даты и времени с точностью до минуты.
 */
export const Default: Story = {
	render: createSingleDateTimeInputStoryRender("date-time"),
	args: {
		label: "Дата и время",
		description: "Фиксированный формат: дд.мм.гггг чч:мм",
		placeholder: "дд.мм.гггг чч:мм",
		timePanelPlacement: "bottom",
		value: new Date(2026, 2, 5, 9, 15, 0, 0)
	}
};

/**
 * Демонстрирует режим выбора только времени на технической дате `1970-01-01`.
 */
export const TimeOnly: Story = {
	render: createSingleDateTimeInputStoryRender("time"),
	args: {
		label: "Время",
		description: "Режим только времени с маской чч:мм и wheel-picker без календаря.",
		placeholder: "чч:мм",
		mode: "time",
		value: new Date(1970, 0, 1, 9, 15, 0, 0),
		minDate: new Date(2026, 2, 10, 9, 15, 0, 0),
		maxDate: new Date(2026, 2, 10, 18, 30, 0, 0)
	}
};

/**
 * Показывает пустое контролируемое значение.
 */
export const Empty: Story = {
	render: createSingleDateTimeInputStoryRender("none"),
	args: {
		label: "Пустое значение",
		description: "Поле можно заполнить вручную или через popover picker.",
		placeholder: "дд.мм.гггг чч:мм",
		timePanelPlacement: "bottom",
		value: null
	}
};

/**
 * Демонстрирует ограничение диапазона и синхронизацию календаря со временем.
 */
export const WithLimits: Story = {
	render: createSingleDateTimeInputStoryRender("none"),
	args: {
		label: "Дата отгрузки",
		description: "Доступен только интервал с 10 по 12 марта 2026 года.",
		minDate: new Date(2026, 2, 10, 9, 0, 0, 0),
		maxDate: new Date(2026, 2, 12, 18, 30, 0, 0),
		timePanelPlacement: "bottom",
		value: new Date(2026, 2, 10, 12, 30, 0, 0)
	}
};

/**
 * Демонстрирует размещение wheel-панели справа от календаря.
 */
export const WithRightPanel: Story = {
	render: createSingleDateTimeInputStoryRender("none"),
	args: {
		label: "Дата и время",
		description: "Wheel-панель времени расположена справа от календаря.",
		timePanelPlacement: "right",
		value: new Date(2026, 2, 10, 12, 30, 0, 0)
	}
};
