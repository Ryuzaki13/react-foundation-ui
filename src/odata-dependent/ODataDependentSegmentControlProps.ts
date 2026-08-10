import type { ReactNode } from "react";

import type { UiSize } from "../types";
import type { UseODataDependentSelectionOptions } from "./model/useODataDependentSelection";
import type { ODataDependentSegmentItem } from "@ryuzaki13/react-foundation-api/odata";

/**
 * Общий UI-контракт segment-level OData-контролов.
 *
 * Контракт намеренно не определяет форму локального значения: Select адаптирует
 * массив к одному элементу, а MultiSelect использует массив напрямую.
 */
export type ODataDependentSegmentControlProps = UseODataDependentSelectionOptions & {
	/** Развёрнутое описание конкретного OData-сегмента. */
	item: ODataDependentSegmentItem;
	/** Дополнительная внешняя блокировка поверх sequential-policy. */
	disabled?: boolean;
	/** Заголовок поля. */
	label?: ReactNode;
	/** Дополнительное описание поля. */
	description?: string;
	/** Размер базового Select или MultiSelect. */
	size?: UiSize;
	/**
	 * Ширина элемента в `em` без служебной добавки базового input.
	 *
	 * @default 15
	 */
	width?: number;
};
