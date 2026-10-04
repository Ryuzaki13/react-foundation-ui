import { type KeyboardEvent, useState } from "react";

import { Input } from "../input";

import { type InputSearchState } from "./InputSearchState";
import { type SearchInputProps } from "./SearchInputProps";

/** Поле хранит черновик до Enter/blur; изменение внешнего value начинает новый поиск без remount. */
export function InputSearch({ onChange, value, defaultValue, ...props }: SearchInputProps) {
	const [state, setState] = useState<InputSearchState>(() => ({
		externalValue: value,
		searchTerm: defaultValue ?? value ?? "",
		previousSearch: defaultValue ?? value ?? ""
	}));

	// Ограниченная корректировка собственного state по предыдущему внешнему value:
	// React повторяет этот render до commit детей, сохраняя DOM и фокус поля.
	// Неизменный value не стирает черновик, а цикл истории A → B → A не возвращает старый ввод.
	if (state.externalValue !== value) {
		setState({
			externalValue: value,
			searchTerm: value ?? state.searchTerm,
			previousSearch: value ?? state.previousSearch
		});
	}

	const handleSearch = (term: string) => {
		const changedTerm = term.trim();

		if (changedTerm === state.previousSearch) return;

		setState({ ...state, previousSearch: changedTerm });
		onChange(changedTerm);
	};

	const handleClear = () => {
		setState({ ...state, searchTerm: "", previousSearch: "" });
		onChange("");
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleSearch(state.searchTerm);
		}
	};

	const handleBlur = () => {
		handleSearch(state.searchTerm);
	};

	const handleChange = (searchTerm: string) => {
		setState({ ...state, searchTerm });
	};

	return (
		<Input
			{...props}
			value={state.searchTerm}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onClear={handleClear}
		/>
	);
}
