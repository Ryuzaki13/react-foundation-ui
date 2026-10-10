import { useEffect, useState } from "react";

import { type AnalyticalModelRow } from "@ryuzaki13/react-foundation-lib/analytical-table";
import { observeElementResize } from "@ryuzaki13/react-foundation-lib/dom";
import { useVirtualizer } from "@tanstack/react-virtual";

/** Начальные размеры детерминированы; sticky-шапка измеряется observer после mount. */
export function useAnalyticalViewport<T>(
	rows: readonly AnalyticalModelRow<T>[],
	rowHeight = 36,
	height = 512,
	overscan = 8,
	headerRows = 1,
	hasTotals = true
) {
	"use no memo";
	const [element, setElement] = useState<HTMLDivElement | null>(null);
	const [headerElement, setHeaderElement] = useState<HTMLTableSectionElement | null>(null);
	const [footerElement, setFooterElement] = useState<HTMLTableSectionElement | null>(null);
	const [measuredFooterHeight, setMeasuredFooterHeight] = useState(0);
	const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
	useEffect(() => {
		if (!headerElement) return;
		return observeElementResize(headerElement, () => setMeasuredHeaderHeight(headerElement.getBoundingClientRect().height));
	}, [headerElement]);
	useEffect(() => {
		if (!footerElement) return;
		return observeElementResize(footerElement, () => setMeasuredFooterHeight(footerElement.getBoundingClientRect().height));
	}, [footerElement]);
	const headerHeight = measuredHeaderHeight || headerRows * rowHeight;
	// Virtualizer владеет mutable измерениями; наружу выдаются render-снимок и команды, а не его instance.
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => element,
		estimateSize: () => rowHeight,
		getItemKey: (index) => rows[index].id,
		initialRect: { width: 1024, height },
		scrollMargin: headerHeight,
		scrollPaddingStart: headerHeight,
		scrollPaddingEnd: hasTotals ? measuredFooterHeight || rowHeight : 0,
		overscan,
		measureElement: (element) => Math.ceil(element.getBoundingClientRect().height) || rowHeight
	});
	return {
		element,
		setElement,
		setHeaderElement,
		setFooterElement,
		headerHeight,
		scrollToIndex: (index: number) => virtualizer.scrollToIndex(index, { align: "auto" }),
		measureRow: (element: HTMLTableRowElement | null) => virtualizer.measureElement(element),
		items: virtualizer.getVirtualItems(),
		totalSize: virtualizer.getTotalSize()
	};
}
export type AnalyticalViewport<T = unknown> = ReturnType<typeof useAnalyticalViewport<T>>;
