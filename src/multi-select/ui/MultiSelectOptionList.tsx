import { Fragment } from "react";

import uiStyles from "../../ui.module.scss";
import { createMultiSelectOptionSections, type MultiSelectOptionEntry } from "../lib/createMultiSelectOptionSections";

import { MultiSelectOptionRow } from "./MultiSelectOptionRow";
import {
	type OptionMultiSelectOptionContent,
	type OptionMultiSelectOptionGroup,
	type OptionMultiSelectOptionKey,
	type OptionMultiSelectOptionState
} from "./optionMultiSelectTypes";

type MultiSelectOptionListProps<TOption> = Readonly<{
	entries: readonly MultiSelectOptionEntry<TOption>[];
	sectionId: string;
	listId: string;
	activeIndex: number;
	selectedKeys: ReadonlySet<OptionMultiSelectOptionKey>;
	query: string;
	highlightQuery: string;
	getOptionKey: (option: TOption) => OptionMultiSelectOptionKey;
	getOptionGroup?: (option: TOption) => OptionMultiSelectOptionGroup | undefined;
	getOptionDisabled?: (option: TOption) => boolean;
	getOptionId: (listId: string, index: number) => string;
	setOptionRef: (index: number, node: HTMLElement | null) => void;
	toggleOption: (option: TOption) => void;
	selectOnlyOption: (option: TOption) => void;
	renderOption: (option: TOption, state: OptionMultiSelectOptionState) => OptionMultiSelectOptionContent;
}>;

/** Рендерит одну selected/available-секцию, сохраняя global option indexes при группировке. */
export function MultiSelectOptionList<TOption>({ entries, sectionId, getOptionGroup, ...rowProps }: MultiSelectOptionListProps<TOption>) {
	const sections = getOptionGroup ? createMultiSelectOptionSections(entries, getOptionGroup) : [{ group: undefined, entries }];

	return sections.map((section, sectionIndex) => {
		const rows = section.entries.map(({ option, index }) => (
			<MultiSelectOptionRow key={`${rowProps.getOptionKey(option)}-${index}`} option={option} index={index} {...rowProps} />
		));

		if (!section.group) {
			return <Fragment key={`${sectionId}-ungrouped-${sectionIndex}`}>{rows}</Fragment>;
		}

		const groupLabelId = `${sectionId}-group-${sectionIndex}`;

		return (
			<div key={`${sectionId}-${section.group.key}-${sectionIndex}`} role="rowgroup" aria-labelledby={groupLabelId}>
				<div id={groupLabelId} role="row" className={uiStyles.uiPopupGroupLabel}>
					<div role="gridcell">{section.group.label}</div>
				</div>
				{rows}
			</div>
		);
	});
}
