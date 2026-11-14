import { type AriaAttributes, type CSSProperties, type ReactNode } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Detail.module.scss";
import {
	DETAIL_SEMANTIC_DESCRIPTION,
	DETAIL_SEMANTIC_LIST,
	DetailContext,
	type DetailType,
	type DetailVerticalAlignment
} from "./DetailContext";
import { DetailItem } from "./DetailItem";

const DETAIL_ROW_GAP_NONE = "none";
const MAX_DETAIL_COLUMNS = 5;

export interface DetailProps extends AriaAttributes {
	columnCount?: number;
	rowGap?: typeof DETAIL_ROW_GAP_NONE | "small" | "normal" | "large";
	children: ReactNode;
	className?: string;

	semantic?: DetailType;
	inline?: boolean;
	center?: boolean;
	vertical?: DetailVerticalAlignment;
	noWrap?: boolean;
	withColon?: boolean;
}

function normalizeColumnCount(columnCount: number) {
	if (!Number.isFinite(columnCount)) {
		return 1;
	}

	return Math.min(MAX_DETAIL_COLUMNS, Math.max(1, Math.trunc(columnCount)));
}

/**
 * Компонент для вывода пар «заголовок-значение» в одну или несколько колонок. Подходит для карточек сущностей, сводок и страниц просмотра.
 */
export function Detail({
	children,
	columnCount = 1,
	rowGap = DETAIL_ROW_GAP_NONE,
	semantic = DETAIL_SEMANTIC_LIST,
	className,
	inline,
	center,
	vertical,
	noWrap,
	withColon,
	...ariaAttributes
}: DetailProps) {
	const classes = cn(styles.detailList, styles[rowGap], className);
	const style = { columnCount: normalizeColumnCount(columnCount) } satisfies CSSProperties;
	const content =
		semantic === DETAIL_SEMANTIC_DESCRIPTION ? (
			<dl {...ariaAttributes} className={classes} style={style}>
				{children}
			</dl>
		) : (
			<ul {...ariaAttributes} className={classes} style={style}>
				{children}
			</ul>
		);

	return <DetailContext.Provider value={{ semantic, inline, center, vertical, noWrap, withColon }}>{content}</DetailContext.Provider>;
}

Detail.Item = DetailItem;
