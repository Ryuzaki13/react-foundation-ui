import { type LocalLinkDialogAdapterProps } from "../../text-editor/editorModel";

/** Тестовый внешний каталог: его поле забирает фокус так же, как поиск материала. */
export function LocalLinkDialogFixture({ isOpen, onConfirm, onClose }: LocalLinkDialogAdapterProps) {
	if (!isOpen) return null;
	return (
		<div role="dialog" aria-label="Каталог ссылок">
			<input aria-label="Поиск ссылки" />
			<button
				type="button"
				onClick={() => {
					onConfirm("/articles/test", "Ссылка");
					onClose();
				}}>
				Выбрать ссылку
			</button>
			<button type="button" onClick={onClose}>
				Отмена
			</button>
		</div>
	);
}
