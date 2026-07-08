import { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from "react";

import { type DraggableAttributes, type DraggableSyntheticListeners, type UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { TableColumnResizeHandle, type TableColumnResizeHandleProps } from "./TableColumnResizeHandle";

export type TableHeaderCellDragState = {
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners;
	setActivatorElement: (element: HTMLElement | null) => void;
	disabled: boolean;
	isDragging: boolean;
};

export type TableHeaderInteractionCellProps = Omit<ComponentPropsWithoutRef<"th">, "children" | "id"> & {
	columnId: UniqueIdentifier;
	children: ReactNode | ((dragState: TableHeaderCellDragState) => ReactNode);
	dragDisabled?: boolean;
	draggingClassName?: string;
	resizeHandle?: TableColumnResizeHandleProps;
};

function renderChildren(children: TableHeaderInteractionCellProps["children"], dragState: TableHeaderCellDragState): ReactNode {
	return typeof children === "function" ? children(dragState) : children;
}

export function TableHeaderInteractionCell({
	columnId,
	children,
	dragDisabled = false,
	draggingClassName,
	resizeHandle,
	className,
	style,
	...thProps
}: TableHeaderInteractionCellProps) {
	const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, /*transition,*/ isDragging, rect } = useSortable({
		id: columnId,
		disabled: dragDisabled
	});
	const lockedWidth = isDragging ? rect.current?.width : undefined;
	const sortableStyle: CSSProperties = {
		transform: CSS.Translate.toString(transform),
		// transition,
		zIndex: isDragging ? "calc(var(--z-header) + 1)" : undefined,
		...(lockedWidth ? { width: lockedWidth, minWidth: lockedWidth } : {}),
		...style
	};
	const dragState: TableHeaderCellDragState = {
		attributes,
		listeners,
		setActivatorElement: setActivatorNodeRef,
		disabled: dragDisabled,
		isDragging
	};

	return (
		<th {...thProps} ref={setNodeRef} className={cn(className, isDragging && draggingClassName)} style={sortableStyle}>
			{renderChildren(children, dragState)}

			{resizeHandle ? <TableColumnResizeHandle {...resizeHandle} /> : null}
		</th>
	);
}
