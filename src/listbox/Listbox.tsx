import { HTMLAttributes, JSX, KeyboardEvent, ReactNode, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
	cn,
	findFirstEnabledIndex,
	findLastEnabledIndex,
	findNextEnabledIndex,
	handleKeyboardActivation
} from "@ryuzaki13/react-foundation-lib/utils";
import { CheckIcon } from "lucide-react";

import uiStyles from "../ui.module.scss";

type ListboxOption<T> = {
	value: T;
	label?: string;
	disabled?: boolean;
};

interface ListboxBaseProps<T> extends Omit<HTMLAttributes<HTMLUListElement>, "onChange" | "defaultValue" | "value"> {
	options: ListboxOption<T>[];
	focusOnMount?: boolean;
	renderItem?: (option: ListboxOption<T>, selected: boolean, active: boolean) => ReactNode;
	getKey?: (option: ListboxOption<T>, index: number) => string;
}

// Вариант для single-select
interface ListboxSingleProps<T> extends ListboxBaseProps<T> {
	multiple?: false;
	value?: T;
	defaultValue?: T;
	onChange?: (value: T, option: ListboxOption<T>) => void;
}

// Вариант для multi-select
interface ListboxMultiProps<T> extends ListboxBaseProps<T> {
	multiple: true;
	value?: T[];
	defaultValue?: T[];
	onChange?: (value: T[], option: ListboxOption<T>) => void;
}

type ListboxProps<T> = ListboxSingleProps<T> | ListboxMultiProps<T>;

const isOptionDisabled = <T,>(option: ListboxOption<T>) => option.disabled === true;

function getInitialFocusIndex<T>(options: ListboxOption<T>[], value: T | T[] | undefined, multiple: boolean | undefined) {
	if (multiple) {
		if (Array.isArray(value) && value.length > 0) {
			const selectedIndex = options.findIndex((option) => value.includes(option.value) && !option.disabled);
			if (selectedIndex >= 0) {
				return selectedIndex;
			}
		}

		return findFirstEnabledIndex(options, isOptionDisabled);
	}

	if (value !== undefined) {
		const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
		if (selectedIndex >= 0) {
			return selectedIndex;
		}
	}

	return findFirstEnabledIndex(options, isOptionDisabled);
}

/**
 * Компонент выбора одного или нескольких элементов из списка. Поддерживает controlled API, поиск по данным и рендер кастомных опций.
 */
export function Listbox<T>(props: ListboxSingleProps<T>): JSX.Element;
export function Listbox<T>(props: ListboxMultiProps<T>): JSX.Element;
export function Listbox<T>(props: ListboxProps<T>): JSX.Element {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { value, defaultValue, multiple, focusOnMount, renderItem, getKey, options, onChange, id: externalId, ...rest } = props;

	const isControlled = value !== undefined;
	const autoId = useId();
	const listId = externalId ?? `${autoId}-listbox`;
	const [internalValue, setInternalValue] = useState<T | T[] | undefined>(defaultValue);
	const listRef = useRef<HTMLUListElement>(null);
	const [focusedIndex, setFocusedIndex] = useState(() => getInitialFocusIndex(options, value ?? defaultValue, multiple));
	// const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const selectedValues = useMemo(
		() => (isControlled ? value : internalValue) ?? (multiple ? [] : null),
		[internalValue, isControlled, multiple, value]
	);
	const activeIndex = /*hoveredIndex ??*/ focusedIndex;

	const handleSelect = (option: ListboxOption<T>) => {
		if (option.disabled) return;

		let newValue: T | T[];
		if (props.multiple) {
			const arr = Array.isArray(selectedValues) ? selectedValues : [];
			newValue = arr.includes(option.value) ? arr.filter((v) => v !== option.value) : [...arr, option.value];

			props.onChange?.(newValue, option);
		} else {
			newValue = option.value;

			props.onChange?.(newValue, option);
		}

		if (!isControlled) setInternalValue(newValue);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			// setHoveredIndex(null);
			setFocusedIndex((index) => findNextEnabledIndex(options, index, 1, isOptionDisabled));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			// setHoveredIndex(null);
			setFocusedIndex((index) => findNextEnabledIndex(options, index, -1, isOptionDisabled));
		} else if (e.key === "Home") {
			e.preventDefault();
			// setHoveredIndex(null);
			setFocusedIndex(findFirstEnabledIndex(options, isOptionDisabled));
		} else if (e.key === "End") {
			e.preventDefault();
			// setHoveredIndex(null);
			setFocusedIndex(findLastEnabledIndex(options, isOptionDisabled));
		} else if (
			handleKeyboardActivation(e, () => {
				const activeOption = options[activeIndex];
				if (activeOption) {
					handleSelect(activeOption);
				}
			})
		) {
			return;
		}
	};

	useEffect(() => {
		const el = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex];
		if (el) el.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	useLayoutEffect(() => {
		if (focusOnMount) {
			listRef.current?.focus();
		}
	}, [focusOnMount]);

	return (
		<ul
			ref={listRef}
			id={listId}
			role="listbox"
			aria-multiselectable={multiple || undefined}
			aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
			tabIndex={0}
			// onMouseLeave={() => setHoveredIndex(null)}
			onKeyDown={handleKeyDown}
			{...rest}
			className={cn(uiStyles.uiPanel, "scrollable")}>
			{options.map((option, index) => {
				const selected = multiple
					? Array.isArray(selectedValues) && selectedValues.includes(option.value)
					: selectedValues === option.value;
				const active = index === activeIndex;

				return (
					<li
						key={getKey ? getKey(option, index) : index}
						id={`${listId}-option-${index}`}
						role="option"
						aria-selected={selected}
						aria-disabled={option.disabled || undefined}
						onMouseDown={(e) => {
							e.preventDefault(); // чтобы не сбрасывался фокус listbox
							if (option.disabled) {
								return;
							}
							setFocusedIndex(index);
							// setHoveredIndex(index);
							handleSelect(option);
						}}
						// onMouseEnter={() => setHoveredIndex(index)}
						tabIndex={-1}
						className={cn(
							uiStyles.uiPopupOption,
							option.disabled && uiStyles.disabled,
							active && uiStyles.uiPopupOptionActive,
							selected && uiStyles.selected
						)}>
						{selected ? (
							<CheckIcon className={uiStyles.uiPopupOptionIcon} />
						) : (
							<span className={uiStyles.uiPopupOptionIcon}></span>
						)}
						<div /*className={uiStyles.uiOptionText}*/>
							{renderItem ? renderItem(option, selected, active) : (option.label ?? String(option.value))}
						</div>
					</li>
				);
			})}
		</ul>
	);
}
