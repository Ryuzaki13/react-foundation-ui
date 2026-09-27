import { type Meta, type StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { LinkTypes, type TextEditorCoreProps, TextEditorLexical } from "../index";

import { TextEditorLifecycleExample } from "./TextEditorLifecycleExample";

const meta = {
	title: "Text/TextEditorLexical",
	component: TextEditorLexical,
	args: {
		initialData: {
			html: "<p>Выделите фрагмент текста и выберите действие на панели. Здесь можно продолжить редактирование.</p>",
			raw: null
		},
		onChange: fn<TextEditorCoreProps["onChange"]>(),
		editableProps: { "aria-label": "Редактируемый документ" }
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Интерактивный редактор форматированного текста. initialData задаёт начальный документ, onChange сообщает новые HTML и Lexical raw; story не возвращает snapshot обратно как initialData при каждом вводе. Профиль панели ограничивает доступные действия, но не очищает загруженные или вставленные данные и не заменяет валидацию consumer. Полный контракт — src/text-editor/README.md."
			}
		}
	},
	argTypes: {
		readOnly: { description: "Блокирует пользовательский ввод и команды без замены документа. По умолчанию false.", control: false },
		ref: {
			description: "TextEditorHandle с единственной операцией clear(): пустой документ и новая история без remount.",
			control: false
		},
		initialData: { description: "Начальные HTML или TextEditorLexicalRaw. Это не controlled value.", control: false },
		onChange: { description: "Получает новый snapshot документа без сохранения в storage или отправки на сервер.", control: false },
		toolbarComponents: { description: "Видимые группы панели и доступные в них стили блоков и типы ссылок.", control: false },
		editableProps: { description: "DOM id и доступные ARIA-атрибуты непосредственно для contenteditable.", control: false },
		externalLinkOptions: { description: "Настройки диалога внешней ссылки, включая доступность QR-представления.", control: false },
		presentation: {
			description: "document — обычная панель; compact — встроенный ввод с командами во всплывающей панели.",
			control: false
		},
		placeholder: { description: "Текст подсказки; null полностью убирает её.", control: false },
		businessAdapters: { description: "Необязательные адаптеры consumer для предметных ссылок.", control: false }
	}
} satisfies Meta<typeof TextEditorLexical>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	name: "Панель по умолчанию",
	parameters: {
		docs: {
			description: {
				story: "Без toolbarComponents сохраняется существующая панель по умолчанию: история и очистка semantic tag; остальные группы включаются явно. Выделение и ввод работают в самом редакторе."
			}
		}
	}
};

export const Restricted: Story = {
	name: "Абзацы, списки и внешние ссылки",
	args: {
		toolbarComponents: {
			blocks: true,
			blockStyles: ["unstyled", "ordered-list-item", "unordered-list-item"],
			inline: true,
			links: true,
			linkTypes: [LinkTypes.LINK],
			history: true,
			alignment: false,
			tags: false,
			clearSemanticTag: false
		},
		externalLinkOptions: { allowQrCode: false }
	},
	parameters: {
		docs: {
			description: {
				story: "Панель оставляет абзац, два вида списков, inline-форматирование и внешнюю ссылку; QR, выравнивание и semantic tags недоступны через эти controls. Выделите текст перед форматированием или созданием ссылки. Это пример настройки действий, а не безопасный профиль сохранения: вставку, исходный raw и итоговый документ валидирует consumer."
			}
		}
	}
};

export const Compact: Story = {
	name: "Компактный ввод",
	args: {
		...Restricted.args,
		presentation: "compact",
		placeholder: null
	},
	parameters: {
		docs: {
			description: {
				story: "Встроенный редактор без внешней рамки и подсказки. Форматирование доступно одной кнопкой с сохранением исходного выделения; размеры целей нажатия не уменьшаются. Длинный текст прокручивается внутри поля. Проверяйте панель и переход к диалогу ссылки также на узком viewport."
			}
		}
	}
};

export const Lifecycle: Story = {
	name: "Чтение и очистка документа",
	args: Restricted.args,
	render: (args) => <TextEditorLifecycleExample {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Измените текст, переключите readOnly и очистите документ. Undo/redo не восстанавливают очищенный текст. Отмена диалога ссылки возвращает фокус и выделение; очистка или readOnly отзывают открытые сессии инструментов. Физическое поведение клавиатуры зависит от браузера."
			}
		}
	}
};

export const CompactLifecycle: Story = {
	...Lifecycle,
	name: "Компактный ввод: чтение и очистка",
	args: { ...Restricted.args, presentation: "compact", placeholder: null }
};
