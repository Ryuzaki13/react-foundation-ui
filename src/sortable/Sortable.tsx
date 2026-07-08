import {
	createContext,
	createElement,
	useContext,
	useMemo,
	type ComponentPropsWithoutRef,
	type CSSProperties,
	type ElementType,
	type ReactNode
} from "react";

import { closestCenter, DndContext, type DndContextProps } from "@dnd-kit/core";
import { SortableContext, useSortable, type SortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDndSortableSensors } from "@ryuzaki13/react-foundation-lib/hooks";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { resolveSortableStrategy, type SortableLayout } from "./sortableUtils";

import type { UniqueIdentifier } from "@dnd-kit/core";

type SortableItemRenderState = {
	isDragging: boolean;
	isOver: boolean;
	isSorting: boolean;
	disabled: boolean;
};

type SortableHandleContextValue = {
	attributes: Record<string, unknown>;
	listeners: Record<string, ((event: unknown) => void) | undefined> | undefined;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	disabled: boolean;
	isDragging: boolean;
};

type SortableRootProps = Omit<DndContextProps, "children" | "collisionDetection" | "sensors"> & {
	children: ReactNode;
	collisionDetection?: DndContextProps["collisionDetection"];
	sensors?: DndContextProps["sensors"];
};

type SortableContainerProps = {
	children: ReactNode;
	containerId: UniqueIdentifier;
	items: readonly UniqueIdentifier[];
	layout?: SortableLayout;
	strategy?: SortingStrategy;
};

type SortableItemBaseProps = {
	as?: ElementType;
	id: UniqueIdentifier;
	children?: ReactNode | ((state: SortableItemRenderState) => ReactNode);
	className?: string;
	style?: CSSProperties;
	disabled?: boolean;
	dragActivator?: "handle" | "item";
};

type SortableItemProps<E extends ElementType = "div"> = SortableItemBaseProps &
	Omit<ComponentPropsWithoutRef<E>, keyof SortableItemBaseProps | "children" | "style" | "id">;

type SortableHandleBaseProps = {
	as?: ElementType;
	children?: ReactNode | ((state: Pick<SortableHandleContextValue, "disabled" | "isDragging">) => ReactNode);
	disabled?: boolean;
};

type SortableHandleProps<E extends ElementType = "div"> = SortableHandleBaseProps &
	Omit<ComponentPropsWithoutRef<E>, keyof SortableHandleBaseProps | "children">;

const SortableHandleContext = createContext<SortableHandleContextValue | null>(null);

function toItemChildren(children: SortableItemProps["children"], state: SortableItemRenderState) {
	return typeof children === "function" ? children(state) : children;
}

function toHandleChildren(children: SortableHandleProps["children"], state: Pick<SortableHandleContextValue, "disabled" | "isDragging">) {
	return typeof children === "function" ? children(state) : children;
}

export function SortableRoot(props: SortableRootProps) {
	const {
		children,
		collisionDetection = closestCenter,
		sensors,
		onDragCancel,
		onDragEnd,
		onDragMove,
		onDragOver,
		onDragPending,
		onDragStart,
		accessibility,
		...restProps
	} = props;
	const defaultSensors = useDndSortableSensors();
	const defaultAccessibilityContainer = typeof document === "undefined" ? undefined : document.body;
	const resolvedAccessibility = useMemo<DndContextProps["accessibility"]>(
		() => ({
			...accessibility,
			container: accessibility?.container ?? defaultAccessibilityContainer
		}),
		[accessibility, defaultAccessibilityContainer]
	);

	return (
		<DndContext
			{...restProps}
			accessibility={resolvedAccessibility}
			sensors={sensors ?? defaultSensors}
			collisionDetection={collisionDetection}
			onDragStart={onDragStart}
			onDragMove={onDragMove}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			onDragCancel={onDragCancel}
			onDragPending={onDragPending}>
			{children}
		</DndContext>
	);
}

export function SortableContainer(props: SortableContainerProps) {
	const { children, containerId, items, layout = "vertical", strategy } = props;

	return (
		<SortableContext id={String(containerId)} items={[...items]} strategy={resolveSortableStrategy(layout, strategy)}>
			{children}
		</SortableContext>
	);
}

export function SortableItem<E extends ElementType = "div">(props: SortableItemProps<E>) {
	const { as, id, children, className, style, disabled = false, dragActivator = "handle", ...restProps } = props;
	const Component = (as ?? "div") as ElementType;
	const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging, isOver, isSorting } = useSortable({
		id,
		disabled
	});

	const itemStyle: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: !disabled && isDragging ? 2 : 1,
		opacity: !disabled && isDragging ? 0.6 : undefined,
		...style
	};
	const handleContextValue = useMemo<SortableHandleContextValue>(
		() => ({
			attributes: attributes as unknown as Record<string, unknown>,
			listeners:
				dragActivator === "handle" ? (listeners as Record<string, ((event: unknown) => void) | undefined> | undefined) : undefined,
			setActivatorNodeRef,
			disabled: disabled || dragActivator !== "handle",
			isDragging
		}),
		[attributes, listeners, setActivatorNodeRef, disabled, dragActivator, isDragging]
	);
	const itemState: SortableItemRenderState = {
		isDragging,
		isOver,
		isSorting,
		disabled
	};
	const dragBindings = dragActivator === "item" && !disabled ? { ...attributes, ...listeners } : {};

	return (
		<SortableHandleContext.Provider value={handleContextValue}>
			{createElement(
				Component,
				{
					...restProps,
					...dragBindings,
					ref: setNodeRef,
					className: cn(className),
					style: itemStyle,
					"data-sortable-id": String(id),
					"data-sortable-dragging": isDragging ? "true" : "false",
					"data-sortable-disabled": disabled ? "true" : "false"
				},
				toItemChildren(children, itemState)
			)}
		</SortableHandleContext.Provider>
	);
}

export function SortableHandle<E extends ElementType = "div">(props: SortableHandleProps<E>) {
	const { as, children, disabled = false, ...restProps } = props;
	const Component = (as ?? "div") as ElementType;
	const context = useContext(SortableHandleContext);
	const handleDisabled = disabled || !context || context.disabled;
	const dragBindings = !handleDisabled ? { ...context.attributes, ...context.listeners } : {};
	const handleState = {
		disabled: handleDisabled,
		isDragging: context?.isDragging ?? false
	};

	return createElement(
		Component,
		{
			...restProps,
			...dragBindings,
			ref: !handleDisabled && context ? context.setActivatorNodeRef : undefined,
			"aria-disabled": handleDisabled || undefined,
			"data-sortable-handle": "true",
			"data-sortable-handle-disabled": handleDisabled ? "true" : "false",
			"data-sortable-handle-dragging": handleState.isDragging ? "true" : "false"
		},
		toHandleChildren(children, handleState)
	);
}
