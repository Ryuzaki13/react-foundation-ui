import { CSSProperties } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";

import { CheckBox } from "../check-box";
import { SelectOptionContent } from "../select/SelectOptionContent";

import styles from "./TreeSelect.module.scss";
import { TreeMultiSelectOptionsLayout, TreeSelectNode } from "./types";

type TreeNodeContentProps = {
	node: TreeSelectNode;
	level: number;
	highlight?: string;
	hasChildren: boolean;
	isExpanded: boolean;
	selected: boolean;
	partial: boolean;
	selectionMode: "single" | "multi";
	optionsLayout?: TreeMultiSelectOptionsLayout;
	onToggleExpand?: () => void;
	onToggleSelection?: () => void;
};

export function TreeNodeContent({
	node,
	level,
	highlight,
	hasChildren,
	isExpanded,
	selected,
	partial,
	selectionMode,
	optionsLayout = "tree",
	onToggleExpand,
	onToggleSelection
}: TreeNodeContentProps) {
	const showExpansionControl = optionsLayout === "tree";

	return (
		<>
			<span className={styles.treeIndent} style={{ "--tree-level": level } as CSSProperties} aria-hidden="true" />
			{showExpansionControl && hasChildren ? (
				<button
					type="button"
					className={styles.treeExpander}
					onClick={(event) => {
						event.stopPropagation();
						onToggleExpand?.();
					}}
					aria-label={isExpanded ? "Свернуть ветку" : "Развернуть ветку"}
					data-ui="tree-select-expander"
					data-action={isExpanded ? "collapse-tree-select-node" : "expand-tree-select-node"}>
					<ChevronRightIcon className={cn(styles.treeExpanderIcon, isExpanded && styles.treeExpanderIconExpanded)} />
				</button>
			) : showExpansionControl ? (
				<span className={styles.treeExpanderPlaceholder} aria-hidden="true" />
			) : null}

			{selectionMode === "multi" && optionsLayout === "columns" ? (
				<span
					className={styles.treeColumnCheckBox}
					onMouseDown={(event) => event.stopPropagation()}
					onClick={(event) => event.stopPropagation()}>
					<CheckBox
						value={selected}
						indeterminate={partial}
						disabled={node.disabled}
						aria-label={`Выбрать ${node.label}`}
						onChange={() => onToggleSelection?.()}
					/>
				</span>
			) : selectionMode === "multi" ? (
				<span
					className={cn(styles.treeSelection, selected && styles.treeSelectionChecked, partial && styles.treeSelectionPartial)}
					aria-hidden="true">
					{selected ? (
						<CheckIcon className={styles.treeSelectionIcon} />
					) : partial ? (
						<MinusIcon className={styles.treeSelectionIcon} />
					) : null}
				</span>
			) : null}

			<div className={styles.treeNodeOptionContent}>
				<SelectOptionContent label={node.label} code={node.code} highlight={highlight} />
			</div>
		</>
	);
}
