import { useState } from "react";

import { TagInput, type TagInputProps } from "../TagInput";

type TagInputControlledFixtureProps = Readonly<
	Omit<TagInputProps, "onChange" | "value"> & {
		initialValue?: readonly string[];
		onChange: TagInputProps["onChange"];
	}
>;

/** Обновляет controlled-value как host и передаёт тесту только зафиксированные изменения тегов. */
export function TagInputControlledFixture({ initialValue = [], onChange, ...props }: TagInputControlledFixtureProps) {
	const [value, setValue] = useState(() => [...initialValue]);

	return (
		<TagInput
			{...props}
			value={value}
			onChange={(nextValue) => {
				setValue(nextValue);
				onChange(nextValue);
			}}
		/>
	);
}
