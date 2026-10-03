import { useState } from "react";

import { InputText } from "../Input";

type InputTextSearchControlledFixtureProps = Readonly<{
	onChange: (value: string) => void;
	onClear: () => void;
}>;

/** Controlled consumer обновляет value теми же callbacks, что и приложение, без подмены InputText. */
export function InputTextSearchControlledFixture({ onChange, onClear }: InputTextSearchControlledFixtureProps) {
	const [value, setValue] = useState("Исходное");
	return (
		<InputText
			type="search"
			value={value}
			onChange={(nextValue) => {
				setValue(nextValue);
				onChange(nextValue);
			}}
			onClear={() => {
				setValue("");
				onClear();
			}}
		/>
	);
}
