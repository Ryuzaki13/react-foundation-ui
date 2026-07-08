import React, { useState } from "react";

import { BaseInputProps, Input } from "../input";

interface SearchInputProps extends BaseInputProps<string> {
	onChange: (value: string) => void;
}

export function InputSearch({ onChange, ...props }: SearchInputProps) {
	const [searchTerm, setSearchTerm] = useState(() => props.defaultValue ?? props.value ?? "");
	const [previousSearch, setPreviousSearch] = useState(() => props.defaultValue ?? props.value ?? "");

	const handleSearch = (term: string) => {
		const changedTerm = term.trim();

		// Проверяем, изменилось ли значение с предыдущего поиска
		if (changedTerm === previousSearch) return;

		setPreviousSearch(changedTerm);
		onChange(changedTerm);
	};

	const handleClear = () => {
		setSearchTerm("");
		setPreviousSearch("");
		onChange("");
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleSearch(searchTerm);
		}
	};

	const handleBlur = () => {
		handleSearch(searchTerm);
	};

	const handleChange = (value: string) => {
		setSearchTerm(value);
		// Не вызываем onSearch здесь - только по Enter/blur
	};

	return (
		<Input {...props} value={searchTerm} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur} onClear={handleClear} />
	);
}
