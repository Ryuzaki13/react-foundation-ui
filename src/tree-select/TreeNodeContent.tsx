import { type CSSProperties, type Ref } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronRightIcon } from "lucide-react";

import { CheckBox } from "../check-box";
import { OptionButton, OptionContent } from "../option";
import { OptionContentContainer } from "../option/OptionContentContainer";

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
	actionRef?: Ref<HTMLButtonElement>;
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
	onActivate,
	actionRef
}: TreeNodeContentProps) {
	const showExpansionControl = optionsLayout === "tree";
	const emphasizeRootContent = optionsLayout === "columns" && level === 0;
	const optionContent = (
		<OptionContent text={node.label} code={node.code} searchText={highlight} emphasizeContent={emphasizeRootContent} />
	);
	const expansionControl = hasChildren ? (
		<span
			className={styles.treeExpander}
			aria-hidden="true"
			onMouseDown={(event) => event.preventDefault()}
			onClick={(event) => {
				event.stopPropagation();
				onToggleExpand?.();
			}}
			data-ui="tree-select-expander"
			data-action={isExpanded ? "collapse-tree-select-node" : "expand-tree-select-node"}>
			<ChevronRightIcon className={cn(styles.treeExpanderIcon, isExpanded && styles.treeExpanderIconExpanded)} />
		</span>
	) : (
		<div className={styles.treeExpanderPlaceholder} aria-hidden="true" />
	);

	if (selectionMode === "multi" && optionsLayout === "tree") {
		return (
			<>
				<div role="gridcell" className={styles.treeNodeSelectionCell}>
					<div className={styles.treeIndent} style={{ "--tree-level": level } as CSSProperties} aria-hidden="true" />
					{expansionControl}
					<div
						className={styles.treeColumnCheckBox}
						onMouseDown={(event) => event.stopPropagation()}
						onClick={(event) => event.stopPropagation()}>
						<CheckBox
							value={selected}
							indeterminate={partial}
							disabled={node.disabled}
							aria-label={`${selected ? "Убрать" : "Добавить"} «${node.label}» ${selected ? "из выбора" : "в выбор"}`}
							onChange={() => onToggleSelection?.()}
						/>
					</div>
				</div>
				<div role="gridcell" className={styles.treeNodeActionCell}>
					<OptionButton
						ref={actionRef}
						className={styles.treeNodeButton}
						tabIndex={-1}
						disabled={node.disabled}
						aria-label={`Выбрать только «${node.label}»`}
						text={node.label}
						code={node.code}
						searchText={highlight}
						onMouseDown={(event) => event.preventDefault()}
						onClick={onActivate}
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<div className={styles.treeIndent} style={{ "--tree-level": level } as CSSProperties} aria-hidden="true" />
			{showExpansionControl ? expansionControl : null}

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

			{optionsLayout === "tree" ? (
				<OptionContentContainer className={styles.treeNodeButton}>{optionContent}</OptionContentContainer>
			) : (
				<OptionButton
					ref={actionRef}
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
			)}
		</>
	);
}
