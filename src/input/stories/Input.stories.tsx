import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { InputNumber, InputText, type BaseInputProps, type InputTextProps } from "../Input";

import type { Meta, StoryObj } from "@storybook/react-vite";

type InputTextStoryArgs = InputTextProps;
type InputNumberStoryArgs = BaseInputProps<number | undefined>;

const renderInputTextStory = createControlledStoryRender<InputTextStoryArgs>((args, updateArgs) => (
	<InputText
		{...args}
		value={args.value ?? ""}
		onChange={(value) => {
			args.onChange?.(value);
			updateArgs({ value });
		}}
		onClear={
			args.onClear
				? () => {
						args.onClear?.();
						updateArgs({ value: "" });
					}
				: undefined
		}
		onClearError={() => {
			args.onClearError?.();
			updateArgs({ error: undefined });
		}}
	/>
));

const renderInputNumberStory = createControlledStoryRender<InputNumberStoryArgs>((args, updateArgs) => (
	<InputNumber
		{...args}
		onChange={(value) => {
			args.onChange?.(value);
			updateArgs({ value });
		}}
		onClear={
			args.onClear
				? () => {
						args.onClear?.();
						updateArgs({ value: undefined });
					}
				: undefined
		}
		onClearError={() => {
			args.onClearError?.();
			updateArgs({ error: undefined });
		}}
	/>
));

const meta = {
	title: "UI/Input",
	component: InputText,
	args: {
		value: "",
		onChange: () => {}
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок поля.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		placeholder: {
			description: "Плейсхолдер нативного поля ввода.",
			control: "text"
		},
		value: {
			description: "Текущее значение поля.",
			control: "text"
		},
		onChange: {
			description: "Вызывается при изменении значения.",
			control: false
		},
		onClear: {
			description: "Callback кнопки очистки справа.",
			control: false
		},
		error: {
			description: "Текст ошибки под полем.",
			control: "text"
		},
		onClearError: {
			description: "Вызывается при вводе для сброса внешней ошибки.",
			control: false
		},
		type: {
			description: "Семантика текстового значения для нативного ввода.",
			control: "select",
			options: ["text", "email", "password", "search", "tel", "url"]
		},
		disabled: {
			description: "Блокирует редактирование.",
			control: "boolean"
		},
		size: {
			description: "Размер поля и подписи.",
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"]
		},
		allowedPattern: {
			description: "Регулярное выражение для валидации введенной строки.",
			control: false
		},
		endAdornment: {
			description: "Дополнительный элемент справа внутри поля.",
			control: false
		},
		endAdornmentClassName: {
			description: "CSS-класс контейнера дополнительного элемента справа.",
			control: "text"
		},
		endAdornmentWidth: {
			description: "Явная ширина области дополнительного элемента справа.",
			control: "text"
		}
	}
} satisfies Meta<InputTextStoryArgs>;

export default meta;
type TextStory = StoryObj<InputTextStoryArgs>;
type NumberStory = StoryObj<InputNumberStoryArgs>;

export const TextControlled: TextStory = {
	render: renderInputTextStory,
	args: {
		label: "Наименование",
		description: "Пример обычного текстового поля.",
		placeholder: "Введите значение",
		value: "",
		size: "md",
		onClear: () => {}
	}
};

export const NumberControlled: NumberStory = {
	render: renderInputNumberStory,
	args: {
		label: "Количество",
		description: "Числовой ввод с min/max.",
		placeholder: "0",
		value: 25,
		min: 0,
		max: 100,
		onChange: () => {},
		onClear: () => {}
	},
	argTypes: {
		value: {
			description: "Текущее числовое значение поля.",
			control: "number"
		}
	},
	parameters: {
		controls: {
			exclude: ["type", "allowedPattern"]
		}
	}
};

export const PatternValidation: TextStory = {
	render: renderInputTextStory,
	args: {
		label: "Только цифры",
		description: "`allowedPattern` подсвечивает невалидный ввод.",
		placeholder: "12345",
		value: "",
		allowedPattern: /^\d*$/
	}
};

export const WithError: TextStory = {
	render: renderInputTextStory,
	args: {
		label: "Логин",
		value: "admin",
		error: "Логин уже занят",
		onClear: () => {},
		onClearError: () => {}
	}
};
