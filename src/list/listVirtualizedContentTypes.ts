import type { ReactNode } from "react";

import type { ListContentProps } from "./ListContent";

interface ListVirtualizedViewportProps {
	readonly isLoading?: boolean;
	/** Предварительная высота строки до фактического измерения в пикселях. */
	readonly estimateSize?: number;
	/** Число дополнительных строк по обе стороны видимой области. */
	readonly overscan?: number;
	/** Сохраняет первую видимую строку и её смещение при изменении набора. */
	readonly preserveScrollAnchor?: boolean;
	/** Смена ключа явно возвращает viewport к началу, например при клиентском поиске. */
	readonly resetKey?: string | number | null;
	readonly emptyContent?: ReactNode;
	readonly "aria-label"?: string;
}

/** Полный набор не требует фиктивной загрузки; прежний paginated API остаётся допустимым. */
type ListVirtualizedPaginationProps =
	| { readonly hasNextPage?: false; readonly fetchNextPage?: () => Promise<unknown> }
	| { readonly hasNextPage: boolean; readonly fetchNextPage: () => Promise<unknown> };

export type ListVirtualizedContentProps<T> = ListContentProps<T> & ListVirtualizedViewportProps & ListVirtualizedPaginationProps;
