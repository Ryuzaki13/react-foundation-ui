import { CheckBox } from "../../check-box";
import { Option, OptionButton } from "../../option";

import styles from "./MultiSelect.module.scss";
import {
	type OptionMultiSelectOptionContent,
	type OptionMultiSelectOptionKey,
	type OptionMultiSelectOptionState
} from "./optionMultiSelectTypes";

type MultiSelectOptionRowProps<TOption> = Readonly<{
	option: TOption;
	index: number;
	listId: string;
	activeIndex: number;
	selectedKeys: ReadonlySet<OptionMultiSelectOptionKey>;
	query: string;
	highlightQuery: string;
	getOptionKey: (option: TOption) => OptionMultiSelectOptionKey;
	getOptionDisabled?: (option: TOption) => boolean;
	getOptionId: (listId: string, index: number) => string;
	setOptionRef: (index: number, node: HTMLElement | null) => void;
	toggleOption: (option: TOption) => void;
	selectOnlyOption: (option: TOption) => void;
	renderOption: (option: TOption, state: OptionMultiSelectOptionState) => OptionMultiSelectOptionContent;
}>;

/** Одна интерактивная строка grid: checkbox меняет draft, основная кнопка подтверждает только эту опцию. */
export function MultiSelectOptionRow<TOption>({
	option,
	index,
	listId,
	activeIndex,
	selectedKeys,
	query,
	highlightQuery,
	getOptionKey,
	getOptionDisabled,
	getOptionId,
	setOptionRef,
	toggleOption,
	selectOnlyOption,
	renderOption
}: MultiSelectOptionRowProps<TOption>) {
	const active = index === activeIndex;
	const optionKey = getOptionKey(option);
	const selected = selectedKeys.has(optionKey);
	const optionDisabled = getOptionDisabled?.(option) ?? false;
	const content = renderOption(option, { selected, active, disabled: optionDisabled, query, highlightQuery });

	return (
		<Option
			id={getOptionId(listId, index)}
			ref={(node) => setOptionRef(index, node)}
			role="row"
			aria-selected={selected}
			aria-disabled={optionDisabled || undefined}
			selected={selected}
			active={active}
			disabled={optionDisabled}>
			<div
				role="gridcell"
				className={styles.optionCheckBox}
				onMouseDown={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}>
				<CheckBox
					value={selected}
					disabled={optionDisabled}
					aria-label={`${selected ? "Убрать" : "Добавить"} «${content.text}» ${selected ? "из выбора" : "в выбор"}`}
					onChange={() => toggleOption(option)}
				/>
			</div>
			<div role="gridcell" className={styles.optionActionCell}>
				<OptionButton
					tabIndex={-1}
					disabled={optionDisabled}
					aria-label={`Выбрать только «${content.text}»`}
					text={content.text}
					code={content.code}
					searchText={highlightQuery}
					onMouseDown={(event) => event.preventDefault()}
					onClick={() => selectOnlyOption(option)}
				/>
			</div>
		</Option>
	);
}
