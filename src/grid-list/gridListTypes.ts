import { type ReactNode } from "react";

import { type CollectionGrouping } from "../collection-layout/model/collectionLayoutTypes";

/** Отступы сетки используют те же токены, что и GridContainer. */
export type GridListGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

/** Заголовки групп занимают весь ряд; карточки разных групп не смешиваются. */
export type GridListGrouping<T> = CollectionGrouping<T>;

type GridListSourceProps<T> = {
	readonly items: readonly T[];
	/** Уникальная устойчивая identity записи, независимая от её текущей позиции. */
	readonly getKey: (item: T, index: number) => string;
	readonly render: (item: T) => ReactNode;
	/** Положительная CSS-длина, например 18rem или var(--card-min-width). На узком viewport карточка занимает всю ширину. */
	readonly minItemWidth: string;
	/** Верхний предел числа колонок; без него ширина контейнера определяет всё число колонок. */
	readonly maxColumns?: number;
	/** Промежуток между рядами и колонками. По умолчанию md. */
	readonly gap?: GridListGap;
	readonly grouping?: GridListGrouping<T>;
	readonly className?: string;
	readonly isLoading?: boolean;
	readonly emptyContent?: ReactNode;
	/** Начальная оценка максимальной высоты карточек одного ряда в пикселях, по умолчанию 120. */
	readonly estimateSize?: number;
	/** Дополнительные ряды по обе стороны viewport, по умолчанию 5. */
	readonly overscan?: number;
	/** Сохраняет исходную запись-якорь и смещение при изменении данных или ширины. По умолчанию true. */
	readonly preserveScrollAnchor?: boolean;
	/** Смена ключа возвращает прокрутку к началу без замены viewport. */
	readonly resetKey?: string | number | null;
	/** Исходные ключи карточек пересекающих viewport рядов; без overscan, заголовков и индикатора загрузки. */
	readonly onVisibleKeysChange?: (keys: readonly string[]) => void;
	readonly "aria-label"?: string;
};

type GridListPaginationProps =
	| { readonly hasNextPage?: false; readonly fetchNextPage?: () => Promise<unknown> }
	| { readonly hasNextPage: boolean; readonly fetchNextPage: () => Promise<unknown> };

/** Виртуализированная сетка полного или постраничного плоского источника; данные остаются у consumer. */
export type GridListContentProps<T> = GridListSourceProps<T> & GridListPaginationProps;
