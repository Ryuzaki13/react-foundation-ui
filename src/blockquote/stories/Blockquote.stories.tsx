import { type Meta, type StoryObj } from "@storybook/react-vite";

import { type UiTone } from "../../types";
import { Blockquote } from "../index";

const toneExamples: readonly { readonly tone: UiTone; readonly text: string }[] = [
	{ tone: "neutral", text: "Нейтральная цитата с базовым оформлением." },
	{ tone: "accent", text: "Цитата, на которую нужно обратить внимание." },
	{ tone: "info", text: "Информация: изменения вступят в силу после сохранения." },
	{ tone: "success", text: "Успех: изменения сохранены." },
	{ tone: "warning", text: "Предупреждение: проверьте данные перед продолжением." },
	{ tone: "error", text: "Ошибка: изменения не сохранены." }
];

const meta = {
	title: "UI/Blockquote",
	component: Blockquote,
	args: {
		children: "Цитата с нейтральным оформлением."
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		tone: {
			description: "Семантический цвет цитаты. По умолчанию neutral.",
			control: "inline-radio",
			options: toneExamples.map(({ tone }) => tone)
		}
	}
} satisfies Meta<typeof Blockquote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Tones: Story = {
	render: () => (
		<>
			{toneExamples.map(({ tone, text }) => (
				<Blockquote key={tone} tone={tone}>
					{text}
				</Blockquote>
			))}
		</>
	)
};

export const RichContent: Story = {
	args: {
		tone: "info",
		cite: "https://example.com/source",
		children: (
			<>
				<p>
					<strong>Условия публикации</strong>
				</p>
				<ul>
					<li>Проверьте заполненные поля.</li>
					<li>Сохраните изменения перед продолжением.</li>
				</ul>
				<p>Источник: инструкция по публикации.</p>
			</>
		)
	}
};

export const NestedNeutral: Story = {
	render: () => (
		<Blockquote tone="warning">
			<p>Предупреждение содержит исходную цитату без статусного оформления.</p>
			<Blockquote>Нейтральная цитата сохраняет собственные фон и границу.</Blockquote>
		</Blockquote>
	)
};
