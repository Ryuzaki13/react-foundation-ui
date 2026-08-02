import { stableStringify } from "@ryuzaki13/react-foundation-lib/utils";

import { Button } from "../../button";
import { LoadingMessage, Message } from "../../misc";
import { Modal, ModalContent, ModalFooter } from "../../modal";
import { SearchConfig } from "../model";

import { AdvancedSearchModalSession } from "./AdvancedSearchModalSession";

export type AdvancedSearchInitialSelection<T extends Record<string, string>> =
	{ status: "loading" } | { status: "error" } | { status: "ready"; items: readonly T[] };

interface SearchModalProps<T extends Record<string, string>> {
	onClose: () => void;
	onItemsSelect: (items: T[]) => void;
	initialSelection: AdvancedSearchInitialSelection<T>;
	config: SearchConfig<T>;
}

/**
 * Создаёт стабильную identity modal-session по владельцу данных и внешним ключам.
 * Новый Query object с теми же строками не должен пересоздавать пользовательский draft.
 */
function buildAdvancedSearchModalSessionKey<T extends Record<string, string>>(config: SearchConfig<T>, items: readonly T[]) {
	return stableStringify({
		leadingKey: String(config.leadingKey),
		service: config.odata.service,
		target: config.odata.target,
		selectedIds: items.map((item) => String(item[config.leadingKey])).sort()
	});
}

/**
 * Query boundary начального выбора. Интерактивная сессия монтируется только после
 * успешной загрузки committed snapshot, поэтому поздний ответ не может стереть draft.
 */
export function AdvancedSearchModal<T extends Record<string, string>>({
	onClose,
	onItemsSelect,
	initialSelection,
	config
}: SearchModalProps<T>) {
	if (initialSelection.status === "ready") {
		return (
			<AdvancedSearchModalSession
				key={buildAdvancedSearchModalSessionKey(config, initialSelection.items)}
				config={config}
				onClose={onClose}
				onItemsSelect={onItemsSelect}
				initialSelectedItems={initialSelection.items}
			/>
		);
	}

	return (
		<Modal isOpen onClose={onClose} title={config.title} size="lg" height="min(50em, 80dvh)">
			<ModalContent>
				{initialSelection.status === "loading" ? (
					<LoadingMessage text="Загружаем выбранные элементы..." />
				) : (
					<Message color="error">Не удалось загрузить выбранные элементы</Message>
				)}
			</ModalContent>

			<ModalFooter>
				<Button onClick={onClose}>Закрыть</Button>
			</ModalFooter>
		</Modal>
	);
}
