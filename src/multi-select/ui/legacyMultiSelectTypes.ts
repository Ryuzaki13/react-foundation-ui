import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

export interface MultiSelectItemState {
	selected: boolean;
	active: boolean;
	disabled: boolean;
	query: string;
	highlightQuery: string;
}

export interface MultiSelectOptionContent {
	text: string;
	code: string | undefined;
}

export interface MultiSelectRenderContext {
	selectedItems: CollectionItem[];
	committedSelectedItems: CollectionItem[];
	availableItems: CollectionItem[];
	query: string;
	open: boolean;
	clearSelection: () => void;
	selectAll: () => void;
	deselectAll: () => void;
}

export interface MultiSelectOptionDisableContext {
	selectedItems: CollectionItem[];
	committedSelectedItems: CollectionItem[];
	selectedKeys: ReadonlySet<string>;
	open: boolean;
}
