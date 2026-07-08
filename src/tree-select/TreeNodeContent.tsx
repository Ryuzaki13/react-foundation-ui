import { CSSProperties } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CheckIcon, ChevronRightIcon, MinusIcon } from "lucide-react";

import { SelectOptionContent } from "../select/SelectOptionContent";

import styles from "./TreeSelect.module.scss";
import { TreeSelectNode } from "./types";

type TreeNodeContentProps = {
	node: TreeSelectNode;
	level: number;
	highlight?: string;
	hasChildren: boolean;
	isExpanded: boolean;
	selected: boolean;
	partial: boolean;
	selectionMode: "single" | "multi";
	onToggleExpand?: () => void;
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
	onToggleExpand
}: TreeNodeContentProps) {
	return (
		<>
			<span className={styles.treeIndent} style={{ "--tree-level": level } as CSSProperties} aria-hidden="true" />
			{hasChildren ? (
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
			) : (
				<span className={styles.treeExpanderPlaceholder} aria-hidden="true" />
			)}

			{selectionMode === "multi" && (
				<span
					className={cn(styles.treeSelection, selected && styles.treeSelectionChecked, partial && styles.treeSelectionPartial)}
					aria-hidden="true">
					{selected ? (
						<CheckIcon className={styles.treeSelectionIcon} />
					) : partial ? (
						<MinusIcon className={styles.treeSelectionIcon} />
					) : null}
				</span>
			)}

			<SelectOptionContent label={node.label} code={node.code} highlight={highlight} />
		</>
	);
}
