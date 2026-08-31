import type { ComponentProps } from "react";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { Switch } from "../Switch";

import type { Meta, StoryObj } from "@storybook/react-vite";

type SwitchStoryArgs = ComponentProps<typeof Switch>;
type BiStateSwitchStoryArgs = Extract<SwitchStoryArgs, { triState?: false }>;
type TriStateSwitchStoryArgs = Extract<SwitchStoryArgs, { triState: true }>;

const renderBiStateSwitchStory = createControlledStoryRender<BiStateSwitchStoryArgs>((args, updateArgs) => (
	<Switch
		{...args}
		triState={false}
		value={args.value ?? false}
		onChange={(value) => {
			args.onChange(value);
			updateArgs({ value });
		}}
	/>
));

const renderTriStateSwitchStory = createControlledStoryRender<TriStateSwitchStoryArgs>((args, updateArgs) => (
	<div style={{ display: "grid", gap: 8 }}>
		<Switch
			{...args}
			triState
			value={args.value}
			onChange={(value) => {
				args.onChange(value);
				updateArgs({ value });
			}}
		/>
		<div>Текущее значение: {String(args.value)}</div>
	</div>
));

const meta = {
	title: "UI/Switch",
	component: Switch,
	args: {
		label: "Режим обработки",
		description: "Переключение состояния",
		value: false,
		onChange: () => {},
		triState: false,
		disabled: false
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		label: {
			description: "Заголовок переключателя.",
			control: "text"
		},
		description: {
			description: "Описание под заголовком.",
			control: "text"
		},
		value: {
			description: "Текущее значение (`boolean` или `undefined` в tri-state).",
			control: "boolean"
		},
		onChange: {
			description: "Вызывается при изменении состояния.",
			control: false
		},
		triState: {
			description: "Включает трехсостоянный режим (`undefined → true → false`).",
			control: "boolean"
		},
		checkedIcon: {
			description: "Кастомная иконка для состояния `true`.",
			control: false
		},
		uncheckedIcon: {
			description: "Кастомная иконка для состояния `false`.",
			control: false
		},
		disabled: {
			description: "Блокирует переключение.",
			control: "boolean"
		}
	}
} satisfies Meta<typeof Switch>;

export default meta;
type BiStateStory = StoryObj<BiStateSwitchStoryArgs>;
type TriStateStory = StoryObj<TriStateSwitchStoryArgs>;

export const BiState: BiStateStory = {
	render: renderBiStateSwitchStory
};

export const TriState: TriStateStory = {
	render: renderTriStateSwitchStory,
	args: {
		triState: true,
		value: undefined
	}
};

export const Disabled: BiStateStory = {
	render: renderBiStateSwitchStory,
	args: {
		disabled: true,
		value: true
	}
};
