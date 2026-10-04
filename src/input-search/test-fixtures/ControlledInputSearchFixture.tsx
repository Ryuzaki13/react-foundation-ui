import { useState } from "react";

import { InputSearch } from "../index";

import { type ControlledInputSearchFixtureProps } from "./ControlledInputSearchFixtureProps";

/** Настоящий controlled consumer возвращает подтверждённый запрос без изменения identity поля. */
export function ControlledInputSearchFixture({ onChange }: ControlledInputSearchFixtureProps) {
	const [value, setValue] = useState("alpha");

	return (
		<InputSearch
			value={value}
			onChange={(search) => {
				onChange(search);
				setValue(search);
			}}
		/>
	);
}
