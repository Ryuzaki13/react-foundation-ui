import { CSSProperties } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronRightIcon } from "lucide-react";

import { CheckBox } from "../check-box";
import { OptionButton } from "../option";

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
	onActivate?: () => void;
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
	onToggleSelection,
	onActivate
}: TreeNodeContentProps) {
	const showExpansionControl = optionsLayout === "tree";
	const emphasizeRootContent = optionsLayout === "columns" && level === 0;

	return (
		<>
			<div className={styles.treeIndent} style={{ "--tree-level": level } as CSSProperties} aria-hidden="true" />
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
				<div className={styles.treeExpanderPlaceholder} aria-hidden="true" />
			) : null}

			{selectionMode === "multi" ? (
				<div
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
				</div>
			) : null}

			<OptionButton
				className={styles.treeNodeButton}
				tabIndex={-1}
				disabled={node.disabled}
				text={node.label}
				code={node.code}
				searchText={highlight}
				emphasizeContent={emphasizeRootContent}
				onMouseDown={(event) => event.preventDefault()}
				onClick={onActivate}
			/>
		</>
	);
}
