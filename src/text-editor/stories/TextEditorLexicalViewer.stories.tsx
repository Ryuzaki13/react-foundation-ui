import { type Meta, type StoryObj } from "@storybook/react-vite";

import { TextEditorLexicalViewer } from "../index";

import styles from "./TextEditorLexicalViewerStories.module.scss";
import {
	accessibleLinksViewerStoryRaw,
	emptyViewerStoryRaw,
	narrowContentViewerStoryRaw,
	nestedListsViewerStoryRaw,
	richTextViewerStoryRaw,
	unsupportedViewerStoryRaw
} from "./textEditorLexicalViewerStoryFixtures";

const meta = {
	title: "Text/TextEditorLexicalViewer",
	component: TextEditorLexicalViewer,
	args: { raw: richTextViewerStoryRaw },
	parameters: {
		atomicCanvas: true,
		layout: "padded",
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Просмотр immutable TextEditorLexicalRaw без создания редактора и без HTML injection. Сервер и браузер строят одно семантическое дерево. Неизвестный или небезопасный документ целиком заменяется fallback. Поддерживаемый профиль и ограничения находятся в src/text-editor/README.md. Компонент не проверяет права доступа и не заменяет валидацию записи приложения."
			}
		}
	},
	argTypes: {
		raw: { description: "Сериализованный immutable snapshot. Для обновления передайте новый объект.", control: false },
		className: { description: "Класс корневого элемента, например для ограничения ширины области чтения.", control: false },
		fallback: {
			description: "Содержимое вместо всего неподдерживаемого документа; не используется для корректного пустого документа.",
			control: false
		}
	}
} satisfies Meta<typeof TextEditorLexicalViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RichText: Story = {
	name: "Текст и все inline-форматы"
};

export const NestedLists: Story = {
	name: "Вложенные списки и нумерация",
	args: { raw: nestedListsViewerStoryRaw },
	parameters: {
		docs: {
			description: {
				story: "Внешний список начинается с 4, вложенный — с 7. Явные value сохраняют номера 8 и 9; обёртки вложенных списков не создают дополнительных маркеров."
			}
		}
	}
};

export const AccessibleLinks: Story = {
	name: "HTTP(S) accessible-link",
	args: { raw: accessibleLinksViewerStoryRaw },
	parameters: {
		docs: {
			description: {
				story: "Две ссылки из сериализованного accessible-link. Рендер не загружает ресурсы и не выполняет переход; переход возможен только при активации ссылки пользователем. Для новой вкладки viewer выставляет noopener noreferrer."
			}
		}
	}
};

export const NarrowContent: Story = {
	name: "Узкая область и длинные строки",
	args: { raw: narrowContentViewerStoryRaw, className: styles.narrow },
	parameters: {
		docs: {
			description: {
				story: "Ширина ограничена областью consumer. Проверьте обычные абзацы, непрерывное слово и inline code на узком viewport в светлой и тёмной темах."
			}
		}
	}
};

export const UnsupportedDocument: Story = {
	name: "Явный fallback неизвестного документа",
	args: {
		raw: unsupportedViewerStoryRaw,
		fallback: <p role="status">Документ содержит неподдерживаемый узел. Частичное содержимое не отображается.</p>
	},
	parameters: {
		docs: {
			description: {
				story: "Корректный первый абзац намеренно соседствует с неизвестным узлом: вместо частичного документа показывается только заданный fallback."
			}
		}
	}
};

export const EmptyDocument: Story = {
	name: "Корректный пустой документ",
	args: { raw: emptyViewerStoryRaw, fallback: <p role="status">Этот fallback не должен появиться для пустого документа.</p> },
	parameters: {
		docs: {
			description: { story: "Пустой root допустим: viewer не создаёт текст-заглушку, не открывает editor и не показывает fallback." }
		}
	}
};
