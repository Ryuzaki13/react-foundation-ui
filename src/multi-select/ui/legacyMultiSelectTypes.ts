import { type CollectionItem } from "@ryuzaki13/react-foundation-lib/odata-service";

export interface DeprecatedMultiSelectItemState {
	selected: boolean;
	active: boolean;
	disabled: boolean;
	query: string;
	highlightQuery: string;
}

export interface DeprecatedMultiSelectOptionContent {
	text: string;
	code: string | undefined;
}

export interface DeprecatedMultiSelectRenderContext {
	selectedItems: CollectionItem[];
	committedSelectedItems: CollectionItem[];
	availableItems: CollectionItem[];
	query: string;
	open: boolean;
	clearSelection: () => void;
	selectAll: () => void;
	deselectAll: () => void;
}

export interface DeprecatedMultiSelectOptionDisableContext {
	selectedItems: CollectionItem[];
	committedSelectedItems: CollectionItem[];
	selectedKeys: ReadonlySet<string>;
	open: boolean;
}
