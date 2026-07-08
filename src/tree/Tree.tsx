// Tree.tsx
import React, { createElement, CSSProperties, KeyboardEvent, useMemo } from "react";

import { cn, handleKeyboardActivation } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Tree.module.scss";

/**
 * Базовый тип — любое дерево с возможным полем children
 */
export interface TreeNodeBase {
	children?: readonly TreeNodeBase[] | undefined;
	[key: string]: unknown;
}

/**
 * Пропсы, которые получает callback рендера узла
 */
export interface TreeNodeRenderProps<T extends TreeNodeBase> {
	node: T;
	level: number;
	hasChildren: boolean;
	isLeaf: boolean;
	path: (string | number)[];
}

/**
 * Основные пропсы компонента Tree
 */
export interface TreeProps<T extends TreeNodeBase> {
	data: readonly T[];
	/**
	 * Ключ для дочерних нод (по умолчанию "children")
	 */
	childrenKey?: keyof T;
	/**
	 * Альтернатива childrenKey — функция, возвращающая children
	 */
	getChildren?: (node: T) => readonly T[] | undefined;
	/**
	 * Как брать ключ для каждого узла (по умолчанию node.id || node.key || index)
	 */
	getKey?: (node: T, index: number, path: (string | number)[]) => React.Key;
	/**
	 * Функция, которая рисует содержимое узла.
	 * Если не передана — делается "разумный" дефолт (node.title || node.text || JSON).
	 */
	renderNode?: (props: TreeNodeRenderProps<T>) => React.ReactNode;
	/**
	 * Если задано — узел считается интерактивным и будет обёрнут в кнопку для клавиатурной доступности.
	 */
	onNodeClick?: (node: T, path: (string | number)[]) => void;

	/* Стилизация и классы — внешняя настройка */
	containerElement?: "ol" | "ul" | "div"; // по умолчанию "ol"
	containerClassName?: string;
	containerStyle?: CSSProperties;
	nestedCounter?: boolean;

	itemClassName?: string;
	itemStyle?: CSSProperties;

	nestedListClassName?: string;
	nestedListStyle?: CSSProperties;

	labelClassName?: string;
	labelStyle?: CSSProperties;
}

/* ---- Вспомогательные реализации ---- */

const defaultChildrenKey = "children";

/** Умный дефолт для получения ключа */
function defaultGetKey<T extends TreeNodeBase>(node: T, index: number) {
	// часто встречающиеся поля — id, key
	const maybeId = (node as Record<string, string>).id ?? (node as Record<string, string>).key;
	return (maybeId as React.Key) ?? index;
}

/** Умолчание для рендера узла (если пользователь не передал renderNode) */
function defaultRenderNode<T extends TreeNodeBase>({ node, level }: TreeNodeRenderProps<T>) {
	const title = (node as Record<string, string>).title ?? (node as Record<string, string>).text ?? (node as Record<string, string>).label;
	if (typeof title === "string" || typeof title === "number") {
		return (
			<div aria-level={level + 1} style={{ display: "inline-block" }}>
				{title}
			</div>
		);
	}
	// fallback — краткое представление объекта
	return <div aria-level={level + 1}>{JSON.stringify(title ?? node)}</div>;
}

/* ---- Компонент ---- */

/**
 * Универсальный компонент Tree
 * Не использует глобальный state и не знает бизнес-логики — всё через renderNode / callbacks.
 */
export function Tree<T extends TreeNodeBase>(props: TreeProps<T>) {
	const {
		data,
		childrenKey = defaultChildrenKey as keyof T,
		getChildren,
		getKey = defaultGetKey,
		renderNode,
		onNodeClick,
		containerElement = "ol",
		containerClassName,
		containerStyle,
		nestedCounter: isContainerNested,
		itemClassName,
		itemStyle,
		nestedListClassName,
		nestedListStyle,
		labelClassName,
		labelStyle
	} = props;

	/**
	 * Получить children для ноды — сначала getChildren, иначе node[childrenKey]
	 */
	const resolveChildren = (node: T): readonly T[] | undefined => {
		if (typeof getChildren === "function") return getChildren(node);
		const maybe = node[childrenKey];
		return Array.isArray(maybe) ? (maybe as readonly T[]) : undefined;
	};

	/**
	 * Компонент/функция, рендерящая один узел (рекурсивно)
	 *
	 * Определяем как вложенную функцию — она использует замыкания resolveChildren, getKey и т.д.
	 * Это простая рекурсия, и ключи выставляются родителем при map'е.
	 */
	const renderNodeRecursively = (node: T, index: number, level: number, path: (string | number)[]): React.ReactElement => {
		const children = resolveChildren(node);
		const hasChildren = Array.isArray(children) && children.length > 0;
		const isLeaf = !hasChildren;

		// Контент узла — либо через renderNode проп, либо дефолтный
		const nodeContent =
			typeof renderNode === "function"
				? renderNode({ node, level, hasChildren, isLeaf, path })
				: defaultRenderNode<T>({ node, level, hasChildren, isLeaf, path });

		// NodeItem — оболочка, которая делает узел интерактивным при наличии onNodeClick
		function NodeItem() {
			const label = (
				<div className={labelClassName} style={labelStyle} aria-current={isLeaf ? undefined : false}>
					{nodeContent}
				</div>
			);

			if (!onNodeClick) {
				// Неинтерактивный вариант — semantic wrapper (div)
				return <div role="presentation">{label}</div>;
			}

			// Интерактивный вариант — кнопка, доступная с клавиатуры
			const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
				// Enter и Space должны срабатывать как клик
				handleKeyboardActivation(e, () => onNodeClick(node, path));
			};

			return (
				<button
					type="button"
					onClick={() => onNodeClick(node, path)}
					onKeyDown={handleKeyDown}
					data-ui="tree-node-button"
					data-action="select-tree-node"
					// семантика уровня — aria-level при необходимости можно добавить
					aria-expanded={hasChildren ? true : undefined}
					style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
					{label}
				</button>
			);
		}

		// Собираем <li> с контентом и, при наличии детей, вложенным списком
		const Li = (
			<li key={getKey(node, index, path)} className={cn(styles.nodeItem, itemClassName)} style={itemStyle}>
				<NodeItem />

				{hasChildren &&
					// дочерний список — используем тот же контейнер, что и root (ol|ul|div)
					createElement(
						containerElement,
						{ className: nestedListClassName ?? styles.nestedList, style: nestedListStyle },
						children!.map((child, ci) => renderNodeRecursively(child as T, ci, level + 1, [...path, ci]))
					)}
			</li>
		);

		return Li;
	};

	const treeContent = useMemo(
		() =>
			data.map((node, i) => {
				const paths: (string | number)[] = [i];
				return renderNodeRecursively(node as T, i, 0, paths);
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			// кусок deps — включаем те пропсы, которые влияют на результат
			data,
			childrenKey,
			// getChildren и getKey — функции, которые могут быть изменены пользователем
			getChildren,
			getKey,
			renderNode,
			onNodeClick,
			containerElement,
			itemClassName,
			itemStyle,
			nestedListClassName,
			nestedListStyle,
			labelClassName,
			labelStyle
		]
	);

	// Рендер внешнего контейнера (по умолчанию ol)
	return createElement(
		containerElement,
		{
			className: cn(containerClassName ?? styles.treeContainer, isContainerNested && styles.nestedСounter),
			style: containerStyle
		},
		treeContent
	);
}
