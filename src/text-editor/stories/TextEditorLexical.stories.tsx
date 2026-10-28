import { type Meta, type StoryObj } from "@storybook/react-vite";
import { Paperclip, SendHorizontal } from "lucide-react";
import { fn } from "storybook/test";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { LinkTypes, type TextEditorCoreProps, TextEditorLexical } from "../index";

import { TextEditorCaretScrollExample } from "./TextEditorCaretScrollExample";
import { TextEditorImperativeFocusExample } from "./TextEditorImperativeFocusExample";
import { TextEditorInitialFocusExample } from "./TextEditorInitialFocusExample";
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
		autoFocus: {
			description: "Один начальный фокус новой редактируемой сессии с кареткой в конце. По умолчанию false; readOnly блокирует его.",
			control: false
		},
		ref: {
			description:
				"TextEditorHandle предоставляет clear(); дополнительный TextEditorFocusHandle — явный focus() с сохранением документа, выделения и истории.",
			control: false
		},
		initialData: { description: "Начальные HTML или TextEditorLexicalRaw. Это не controlled value.", control: false },
		onChange: { description: "Получает новый snapshot документа без сохранения в storage или отправки на сервер.", control: false },
		toolbarComponents: { description: "Видимые группы панели и доступные в них стили блоков и типы ссылок.", control: false },
		editableProps: { description: "DOM id и доступные ARIA-атрибуты непосредственно для contenteditable.", control: false },
		externalLinkOptions: { description: "Настройки диалога внешней ссылки, включая доступность QR-представления.", control: false },
		clipboardOptions: {
			description: "Независимый профиль оформления вставляемого фрагмента; без профиля сохраняется штатный импорт.",
			control: false
		},
		presentation: {
			description: "document — обычная панель; compact — встроенный ввод со скрытыми по умолчанию инструментами над полем.",
			control: false
		},
		placeholder: { description: "Текст подсказки; null полностью убирает её.", control: false },
		endAdornment: {
			description: "Содержимое справа внутри рамки поля, отдельно от contenteditable. Состояниями и действиями управляет consumer.",
			control: false
		},
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
				story: "Встроенный редактор без внешней рамки и подсказки. Кнопка раскрывает инструменты над полем без всплывающего окна. Панель остаётся открытой после команды и форматирует текущее выделение, в том числе после его изменения. Повторное нажатие или Escape внутри панели скрывает инструменты. Размеры целей нажатия не уменьшаются; длинный текст и панель прокручиваются отдельно. Проверьте последовательное форматирование и переход к диалогу ссылки также на телефоне с экранной клавиатурой."
			}
		}
	}
};

export const CompactWithActions: Story = {
	...Compact,
	name: "Компактный ввод: действия внутри поля справа",
	args: {
		...Compact.args,
		endAdornment: (
			<FlexContainer gap="xs" align="center">
				<Button icon={<Paperclip />} title="Прикрепить" onClick={fn()} />
				<Button icon={<SendHorizontal />} title="Отправить" tone="accent" onClick={fn()} />
			</FlexContainer>
		)
	},
	parameters: {
		docs: {
			description: {
				story: "Кнопка форматирования остаётся слева снаружи поля. Скрепка и отправка находятся справа внутри общей рамки; текст занимает собственную область и не попадает под кнопки. Панель форматирования скрыта по умолчанию и раскрывается над полем. Введите несколько строк и проверьте узкую ширину. Кнопки демонстрируют компоновку: файлы не выбираются и сообщение не отправляется."
			}
		}
	}
};

export const ClipboardProfile: Story = {
	...Compact,
	name: "Вставка в ограниченный профиль",
	args: {
		...Compact.args,
		clipboardOptions: {
			profile: {
				blockStyles: ["unstyled", "ordered-list-item", "unordered-list-item"],
				inlineStyles: ["BOLD", "ITALIC", "UNDERLINE", "STRIKETHROUGH", "HIGHLIGHT", "CODE"]
			}
		}
	},
	parameters: {
		docs: {
			description: {
				story: "Вставьте текст с заголовками, выравниванием, списками и семантическими тегами через контекстное меню. Сохраняются абзацы, списки и разрешённое inline-оформление; остальная разметка превращается в текст. В этом примере normalizeLinkUrl не задан, поэтому подписи вставляемых ссылок остаются текстом. Начальный документ и кнопки панели политикой не изменяются."
			}
		}
	}
};

export const CompactCaretScroll: Story = {
	...Compact,
	name: "Компактный ввод: внешняя прокрутка",
	args: { ...Compact.args, initialData: { html: "<p>Проверка каретки</p>", raw: null } },
	render: (args) => <TextEditorCaretScrollExample {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Прокрутите host не до конца и вводите Enter с паузой около секунды. Внешний scroll не меняется; после ограничителя editable прокручивается только внутри. Проверьте Shift+Enter, стрелки, undo/redo и смену размеров. Пример не отправляет данные."
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

export const InitialFocus: Story = {
	name: "Начальный фокус новой сессии",
	args: { ...Restricted.args, presentation: "compact", placeholder: null },
	render: (args) => <TextEditorInitialFocusExample {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Нажмите «Открыть новый документ»: новый editable получает фокус и каретку в конце без программной прокрутки host-экрана. Очистка и повторное разрешение ввода не повторяют autoFocus. Открытие в режиме чтения не фокусирует поле. Проверка физической экранной клавиатуры остаётся отдельным browser/device gate."
			}
		}
	}
};

export const ImperativeFocus: Story = {
	name: "Возврат фокуса в текущий документ",
	args: { ...Restricted.args, presentation: "compact", placeholder: null },
	render: (args) => <TextEditorImperativeFocusExample {...args} />,
	parameters: {
		docs: {
			description: {
				story: "Явная команда consumer возвращает фокус без нового документа или сброса undo. Сохраняется прежнее выделение; если его нет, каретка ставится в конец. preventScroll по умолчанию true: native focus и Lexical reconciliation не прокручивают host. ReadOnly и отозванный handle не фокусируют editor."
			}
		}
	}
};
