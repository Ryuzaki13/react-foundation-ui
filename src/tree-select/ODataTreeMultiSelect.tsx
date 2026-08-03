import { useMemo } from "react";

import { ODataDependentBaseProps } from "@ryuzaki13/react-foundation-api/odata";

import { UiBaseProps } from "../types";

import { useODataTreeData } from "./model/useODataTreeData";
import { TreeMultiSelect } from "./TreeMultiSelect";
import { TreeMultiSelectOptionsLayout, TreeMultiSelectValue, TreeSelectNode } from "./types";

export type ODataTreeMultiSelectNodesTransformContext = {
	/** Фактический порядок запрошенных уровней после разрешения metadata-chain. */
	orderedCodeKeys: readonly string[];
};

export type ODataTreeMultiSelectNodesTransform = (
	nodes: readonly TreeSelectNode[],
	context: ODataTreeMultiSelectNodesTransformContext
) => readonly TreeSelectNode[];

export interface ODataTreeMultiSelectProps
	extends Omit<ODataDependentBaseProps, "model" | "value" | "dependencies">, Omit<UiBaseProps<TreeMultiSelectValue>, "placeholder"> {
	model?: ODataDependentBaseProps["model"];
	placeholder?: string;
	query?: string;
	defaultQuery?: string;
	onQuery?: (value: string) => void;
	/** Переключает способ показа загруженного OData-дерева, не меняя формат value и запросов. */
	optionsLayout?: TreeMultiSelectOptionsLayout;
	/**
	 * Ключи OData-уровней, раскрываемых после появления загруженных узлов.
	 * В режиме `columns` дерево по-прежнему отображается полностью раскрытым.
	 */
	defaultExpandedCodeKeys?: readonly string[];
	/** Явный порядок уровней поверх порядка, автоматически полученного из metadata-chain. */
	segmentOrder?: readonly string[];
	/** Уровни, на которых пустой код не обрывает последующие уровни дерева. */
	allowEmptyCodeKeys?: readonly string[];
	/**
	 * Создаёт consumer-представление поверх уже загруженного OData-дерева.
	 *
	 * Преобразование не меняет Query cache и transport-запрос. Callback должен
	 * оставаться чистым и возвращать новые узлы, не мутируя входное дерево.
	 */
	transformNodes?: ODataTreeMultiSelectNodesTransform;
}

export function ODataTreeMultiSelect({
	label,
	description,
	disabled,
	size,
	placeholder,
	query,
	defaultQuery,
	onQuery,
	optionsLayout,
	value,
	onChange,
	odata,
	segments,
	model,
	defaultExpandedCodeKeys,
	segmentOrder,
	allowEmptyCodeKeys,
	transformNodes
}: ODataTreeMultiSelectProps) {
	const treeData = useODataTreeData({
		odata,
		segments,
		model,
		segmentOrder,
		allowEmptyCodeKeys
	});
	const nodes = useMemo(
		() => transformNodes?.(treeData.nodes, { orderedCodeKeys: treeData.orderedCodeKeys }) ?? treeData.nodes,
		[transformNodes, treeData.nodes, treeData.orderedCodeKeys]
	);

	return (
		<TreeMultiSelect
			label={label}
			description={description}
			disabled={disabled || treeData.isLoading}
			size={size}
			placeholder={placeholder ?? treeData.placeholder}
			nodes={nodes}
			value={value}
			onChange={onChange}
			query={query}
			defaultQuery={defaultQuery}
			onQuery={onQuery}
			optionsLayout={optionsLayout}
			defaultExpandedCodeKeys={defaultExpandedCodeKeys}
			isLoading={treeData.isLoading}
			error={treeData.isError ? "Ошибка загрузки" : undefined}
		/>
	);
}
