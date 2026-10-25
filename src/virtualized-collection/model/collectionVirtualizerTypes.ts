import { type VirtualItem } from "@tanstack/react-virtual";

export type CollectionVirtualizerOptions<T> = {
	readonly items: readonly T[];
	readonly getKey: (item: T, index: number) => string;
	/**
	 * Внутренние уникальные identities в порядке чтения; каждый ряд содержит
	 * хотя бы один ключ. Колонки сохраняют по ним якорь при пересборке рядов,
	 * а getKey по-прежнему определяет только identity измеряемой геометрии.
	 */
	readonly getAnchorKeys?: (item: T, index: number) => readonly string[];
	/** Проецирует видимые измеряемые ряды в ключи данных; служебный заголовок возвращает []. */
	readonly getVisibleKeys?: (item: T, index: number) => readonly string[];
	readonly hasNextPage?: boolean;
	readonly estimateSize?: number;
	/** Расстояние между измеряемыми рядами в пикселях, без внешних отступов коллекции. */
	readonly gap?: number;
	/** Смена геометрии сбрасывает размеры невидимых рядов и заново измеряет живые DOM-узлы. */
	readonly measurementKey?: string | number;
	/** CSS-сетка меняет измеряемые ряды при resize; отложенная обработка разрывает ResizeObserver delivery cycle. */
	readonly useAnimationFrameWithResizeObserver?: boolean;
	readonly overscan?: number;
	readonly preserveScrollAnchor?: boolean;
	readonly resetKey?: string | number | null;
	readonly onVisibleKeysChange?: (keys: readonly string[]) => void;
};

/** React получает геометрию и identities окна: изменяемый TanStack instance не покидает владельца. */
export type CollectionVirtualizerSnapshot = {
	readonly virtualItems: readonly Readonly<VirtualItem>[];
	readonly totalSize: number;
	/** Логические identities всего DOM-окна, включая overscan, для переноса окна на новую упаковку. */
	readonly anchorKeys: readonly string[];
};

export type CollectionVirtualizerResult = CollectionVirtualizerSnapshot & {
	readonly attachScrollElement: (element: HTMLDivElement | null) => void;
	readonly measureElement: (element: HTMLElement | null) => void;
};

export type CollectionVirtualizerDriver<T> = {
	readonly subscribe: (listener: () => void) => () => void;
	readonly getSnapshot: () => CollectionVirtualizerSnapshot;
	readonly getServerSnapshot: () => CollectionVirtualizerSnapshot;
	readonly mount: () => () => void;
	readonly commit: (options: CollectionVirtualizerOptions<T>) => void;
	readonly attachScrollElement: (element: HTMLDivElement | null) => void;
	readonly measureElement: (element: HTMLElement | null) => void;
};
