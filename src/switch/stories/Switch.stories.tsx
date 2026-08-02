import type { ComponentProps } from "react";

import { useArgs } from "storybook/preview-api";

import { Switch } from "../Switch";

import type { Meta, StoryObj } from "@storybook/react-vite";

type SwitchStoryArgs = ComponentProps<typeof Switch>;
type BiStateSwitchStoryArgs = Extract<SwitchStoryArgs, { triState?: false }>;
type TriStateSwitchStoryArgs = Extract<SwitchStoryArgs, { triState: true }>;

function BiStateSwitchStoryCanvas({ args }: { args: BiStateSwitchStoryArgs }) {
	const [, updateArgs] = useArgs<BiStateSwitchStoryArgs>();

	return (
		<Switch
			{...args}
			triState={false}
			value={args.value ?? false}
			onChange={(value) => {
				args.onChange(value);
				updateArgs({ value });
			}}
		/>
	);
}

function TriStateSwitchStoryCanvas({ args }: { args: TriStateSwitchStoryArgs }) {
	const [, updateArgs] = useArgs<TriStateSwitchStoryArgs>();

	return (
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
	);
}

const meta = {
	title: "Shared/UI/Switch",
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
	render: function Render(args) {
		return <BiStateSwitchStoryCanvas args={args} />;
	}
};

export const TriState: TriStateStory = {
	render: function Render(args) {
		return <TriStateSwitchStoryCanvas args={args} />;
	},
	args: {
		triState: true,
		value: undefined
	}
};

export const Disabled: BiStateStory = {
	render: function Render(args) {
		return <BiStateSwitchStoryCanvas args={args} />;
	},
	args: {
		disabled: true,
		value: true
	}
};
