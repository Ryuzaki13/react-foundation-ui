import { type ReactNode } from "react";

import { type ListContentProps } from "./ListContent";

type ListVirtualizedViewportProps = Readonly<{
	isLoading?: boolean;
	/** Предварительная высота строки до фактического измерения в пикселях. */
	estimateSize?: number;
	/** Число дополнительных строк по обе стороны видимой области. */
	overscan?: number;
	/** Сохраняет первую видимую строку и её смещение при изменении набора. */
	preserveScrollAnchor?: boolean;
	/** Смена ключа явно возвращает viewport к началу, например при клиентском поиске. */
	resetKey?: string | number | null;
	/** Ключи реально пересекающих viewport записей, без overscan и загрузочного sentinel. */
	onVisibleKeysChange?: (keys: readonly string[]) => void;
	emptyContent?: ReactNode;
	"aria-label"?: string;
}>;

/** Полный набор не требует фиктивной загрузки; прежний paginated API остаётся допустимым. */
type ListVirtualizedPaginationProps =
	| Readonly<{ hasNextPage?: false; fetchNextPage?: () => Promise<unknown> }>
	| Readonly<{ hasNextPage: boolean; fetchNextPage: () => Promise<unknown> }>;

export type ListVirtualizedContentProps<T> = ListContentProps<T> & ListVirtualizedViewportProps & ListVirtualizedPaginationProps;
